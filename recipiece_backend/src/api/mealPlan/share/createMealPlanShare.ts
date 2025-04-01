import { PrismaTransaction } from "@recipiece/database";
import { CreateMealPlanShareRequestSchema, MealPlanShareSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { ConflictError } from "../../../util/error";
import { sendMealPlanSharedPushNotification } from "../../../util/pushNotification";

/**
 * Allow a user to share a meal plan they own with another user.
 */
export const createMealPlanShare = async (request: AuthenticatedRequest<CreateMealPlanShareRequestSchema>, tx: PrismaTransaction): ApiResponse<MealPlanShareSchema> => {
  const { meal_plan_id, user_kitchen_membership_id } = request.body;
  const user = request.user;

  const membership = await tx.userKitchenMembership.findUnique({
    where: {
      id: user_kitchen_membership_id,
      OR: [{ source_user_id: user.id }, { destination_user_id: user.id }],
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

  const mealPlan = await tx.mealPlan.findUnique({
    where: {
      id: meal_plan_id,
      user_id: user.id,
    },
  });

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${meal_plan_id} not found`,
      },
    ];
  }

  try {
    const share = await tx.mealPlanShare.create({
      data: {
        meal_plan_id: mealPlan.id,
        user_kitchen_membership_id: user_kitchen_membership_id,
      },
      include: {
        meal_plan: true,
      },
    });

    const subscriptions = await tx.userPushNotificationSubscription.findMany({
      where: {
        user_id: membership.source_user_id === user.id ? membership.destination_user_id : membership.source_user_id,
      },
    });
    if (subscriptions.length > 0) {
      subscriptions.forEach(async (sub) => {
        await sendMealPlanSharedPushNotification(sub, membership.source_user_id === user.id ? membership.destination_user : membership.source_user, mealPlan);
      });
    }

    return [StatusCodes.CREATED, share];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      throw new ConflictError("Meal plan has already been shared");
    }
    throw err;
  }
};
