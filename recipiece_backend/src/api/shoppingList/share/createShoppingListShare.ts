import { PrismaTransaction } from "@recipiece/database";
import { CreateShoppingListShareRequestSchema, ShoppingListShareSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { ConflictError } from "../../../util/error";
import { sendShoppingListSharedPushNotification } from "../../../util/pushNotification";

/**
 * Allow a user to share a shopping list they own with another user.
 */
export const createShoppingListShare = async (
  request: AuthenticatedRequest<CreateShoppingListShareRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<ShoppingListShareSchema> => {
  const { shopping_list_id, user_kitchen_membership_id } = request.body;
  const user = request.user;

  const membership = await tx.userKitchenMembership.findUnique({
    where: {
      id: user_kitchen_membership_id,
      OR: [
        {source_user_id: user.id},
        {destination_user_id: user.id},
      ],
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

  const shoppingList = await tx.shoppingList.findUnique({
    where: {
      id: shopping_list_id,
      user_id: user.id,
    },
  });

  if (!shoppingList) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping list ${shopping_list_id} not found`,
      },
    ];
  }

  try {
    const share = await tx.shoppingListShare.create({
      data: {
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: user_kitchen_membership_id,
      },
      include: {
        shopping_list: true,
      },
    });

    const subscriptions = await tx.userPushNotificationSubscription.findMany({
      where: {
        user_id: membership.source_user_id === user.id ? membership.destination_user_id : membership.source_user_id,
      },
    });
    if (subscriptions.length > 0) {
      subscriptions.forEach(async (sub) => {
        await sendShoppingListSharedPushNotification(
          sub,
          membership.source_user_id === user.id ? membership.destination_user : membership.source_user,
          shoppingList,
        );
      });
    }

    return [StatusCodes.CREATED, share];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      throw new ConflictError("Shopping list has already been shared");
    }
    throw err;
  }
};
