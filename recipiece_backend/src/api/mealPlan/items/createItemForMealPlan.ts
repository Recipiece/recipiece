import { CreateMealPlanItemRequestSchema, MealPlanItemSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const createItemForMealPlan = async (
  request: AuthenticatedRequest<CreateMealPlanItemRequestSchema>
): ApiResponse<MealPlanItemSchema> => {
  const { id: userId } = request.user;
  const { meal_plan_id, ...restMealPlanItem } = request.body;

  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: meal_plan_id,
      user_id: userId,
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
    }
  });
  return [StatusCodes.OK, mealPlanItem];
};
