import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { MealPlanSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getMealPlanById = async (request: AuthenticatedRequest): ApiResponse<MealPlanSchema> => {
  const { id: userId } = request.user;
  const mealPlanId = +request.params.id;

  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      user_id: userId,
    },
  });

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${mealPlanId} not found`,
      },
    ];
  }
  return [StatusCodes.OK, mealPlan];
};
