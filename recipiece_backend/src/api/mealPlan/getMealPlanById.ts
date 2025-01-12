import { Prisma } from "@prisma/client";
import { prisma } from "../../database";
import { MealPlanSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { StatusCodes } from "http-status-codes";

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
