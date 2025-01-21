import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { prisma } from "@recipiece/database";

export const deleteItemForMealPlan = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const { id: mealPlanId, itemId: mealPlanItemId } = request.params;

  const mealPlanItem = await prisma.mealPlanItem.findFirst({
    where: {
      id: +mealPlanItemId,
      meal_plan_id: +mealPlanId,
    },
  });

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
