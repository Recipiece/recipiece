import { StatusCodes } from "http-status-codes";
import { mealPlanSharesWithMemberships, prisma } from "@recipiece/database";
import { MealPlanSchema, YMealPlanConfigurationSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getMealPlanById = async (request: AuthenticatedRequest): ApiResponse<MealPlanSchema> => {
  const user = request.user;
  const mealPlanId = +request.params.id;

  const mealPlan = await prisma.$kysely
      .selectFrom("meal_plans")
      .selectAll("meal_plans")
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
  return [StatusCodes.OK, {
    ...mealPlan,
    configuration: YMealPlanConfigurationSchema.cast(mealPlan.configuration),
  }];
};
