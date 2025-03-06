import { PrismaTransaction } from "@recipiece/database";
import { CookbookShareSchema, CreateCookbookShareRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { ConflictError } from "../../../util/error";
import { sendCookbookSharedPushNotification } from "../../../util/pushNotification";

export const createCookbookShare = async (
  request: AuthenticatedRequest<CreateCookbookShareRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<CookbookShareSchema> => {
  const { cookbook_id, user_kitchen_membership_id } = request.body;
  const user = request.user;

  const membership = await tx.userKitchenMembership.findUnique({
    where: {
      id: user_kitchen_membership_id,
      source_user_id: user.id,
      status: "accepted",
    },
    include: {
      source_user: true,
      destination_user: true,
    },
  });

  if (!membership) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `User kitchen membership ${user_kitchen_membership_id} not found`,
      },
    ];
  }

  const cookbook = await tx.cookbook.findUnique({
    where: {
      id: cookbook_id,
      user_id: user.id,
    },
  });

  if (!cookbook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${cookbook_id} not found`,
      },
    ];
  }

  try {
    const share = await tx.cookbookShare.create({
      data: {
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: user_kitchen_membership_id,
      },
      include: {
        cookbook: true,
      },
    });

    const subscriptions = await tx.userPushNotificationSubscription.findMany({
      where: {
        user_id: membership.destination_user_id,
      },
    });
    if (subscriptions.length > 0) {
      subscriptions.forEach(async (sub) => {
        await sendCookbookSharedPushNotification(sub, membership.source_user, cookbook);
      });
    }

    return [StatusCodes.OK, share];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      throw new ConflictError("Meal plan has already been shared");
    }
    throw err;
  }
};
