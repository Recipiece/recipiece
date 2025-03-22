import { PrismaTransaction } from "@recipiece/database";
import { MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { getMealPlanByIdQuery } from "./query";

export const getMealPlan = async (
  request: AuthenticatedRequest,
  tx: PrismaTransaction
): ApiResponse<MealPlanSchema> => {
  const user = request.user;
  const mealPlanId = +request.params.id;

  const mealPlan = await getMealPlanByIdQuery(tx, user, mealPlanId).executeTakeFirst();

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
