import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { mealPlanSharesWithMemberships, prisma } from "@recipiece/database";

export const deleteItemForMealPlan = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const user = request.user;
  const { id: mealPlanId, itemId: mealPlanItemId } = request.params;

  const mealPlanItem = await prisma.$kysely
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

  await prisma.mealPlanItem.delete({
    where: {
      id: +mealPlanItemId,
    },
  });
  return [StatusCodes.OK, {}];
};
