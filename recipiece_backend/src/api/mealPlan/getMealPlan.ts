import { mealPlanSharesSubquery, mealPlanSharesWithMemberships, prisma } from "@recipiece/database";
import { MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getMealPlan = async (request: AuthenticatedRequest): ApiResponse<MealPlanSchema> => {
  const user = request.user;
  const mealPlanId = +request.params.id;

  const mealPlan = await prisma.$kysely
      .selectFrom("meal_plans")
      .selectAll("meal_plans")
      .select((eb) => {
        return [mealPlanSharesSubquery(eb, user.id).as("shares")]
      })
      .where((eb) => {
        return eb.and([
          eb("meal_plans.id", "=", mealPlanId),
          eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]),
        ]);
      })
      .executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${mealPlanId} not found`,
      },
    ];
  }
  return [StatusCodes.OK, mealPlan as MealPlanSchema];
};
