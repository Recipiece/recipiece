import { mealPlanSharesWithMemberships, PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const deleteItemForMealPlan = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const user = request.user;
  const { id: mealPlanId, itemId: mealPlanItemId } = request.params;

  const mealPlanItem = await tx.$kysely
    .selectFrom("meal_plans")
    .leftJoin("meal_plan_items", "meal_plan_items.meal_plan_id", "meal_plans.id")
    .selectAll("meal_plan_items")
    .where((eb) => {
      return eb.and([
        eb("meal_plans.id", "=", mealPlanId),
        eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]),
        eb("meal_plan_items.id", "=", mealPlanItemId),
      ]);
    })
    .executeTakeFirst();

  if (!mealPlanItem) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan item ${mealPlanItemId} not found`,
      },
    ];
  }

  await tx.mealPlanItem.delete({
    where: { id: mealPlanItem.id! },
  });

  return [StatusCodes.OK, {}];
};
