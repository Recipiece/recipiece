import { CreateMealPlanRequestSchema, MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createMealPlan = async (
  request: AuthenticatedRequest<CreateMealPlanRequestSchema>
): ApiResponse<MealPlanSchema> => {
  const { id: userId } = request.user;
  const mealPlanBody = request.body;

  try {
    const createdMealPlan = await prisma.mealPlan.create({
      data: {
        user_id: userId,
        ...mealPlanBody,
      },
    });
    return [StatusCodes.CREATED, createdMealPlan];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unknown error",
      },
    ];
  }
};
