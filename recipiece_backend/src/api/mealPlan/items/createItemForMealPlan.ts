import { CreateMealPlanItemRequestSchema, MealPlanItemSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { mealPlanSharesWithMemberships, prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const createItemForMealPlan = async (request: AuthenticatedRequest<CreateMealPlanItemRequestSchema>): ApiResponse<MealPlanItemSchema> => {
  const user = request.user;
  const { meal_plan_id, ...restMealPlanItem } = request.body;

  const mealPlan = await prisma.$kysely
      .selectFrom("meal_plans")
      .selectAll("meal_plans")
      .where((eb) => {
        return eb.and([
          eb("meal_plans.id", "=", meal_plan_id),
          eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]),
        ]);
      })
      .executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${meal_plan_id} not found`,
      },
    ];
  }

  const mealPlanItem = await prisma.mealPlanItem.create({
    data: {
      ...restMealPlanItem,
      meal_plan_id: mealPlan.id,
    },
    include: {
      recipe: {
        include: {
          ingredients: true,
          steps: true,
        },
      },
    },
  });
  return [StatusCodes.OK, mealPlanItem];
};
