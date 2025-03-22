import { PrismaTransaction } from "@recipiece/database";
import { CreateMealPlanRequestSchema, MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createMealPlan = async (
  request: AuthenticatedRequest<CreateMealPlanRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<MealPlanSchema> => {
  const { id: userId } = request.user;
  const mealPlanBody = request.body;

  const createdMealPlan = await tx.mealPlan.create({
    data: {
      user_id: userId,
      ...mealPlanBody,
    },
  });
  return [StatusCodes.CREATED, createdMealPlan as MealPlanSchema];
};
