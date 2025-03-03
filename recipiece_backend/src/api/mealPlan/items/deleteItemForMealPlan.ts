import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { getMealPlanByIdQuery } from "../query";

export const deleteItemForMealPlan = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const user = request.user;
  const { id: mealPlanId, itemId: mealPlanItemId } = request.params;

  const mealPlan = await getMealPlanByIdQuery(tx, user, mealPlanId).executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan item ${mealPlanItemId} not found`,
      },
    ];
  }

  const mealPlanItem = await tx.mealPlanItem.findFirst({
    where: {
      id: mealPlanItemId,
      meal_plan_id: mealPlan.id,
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

  await tx.mealPlanItem.delete({
    where: { id: mealPlanItem.id! },
  });

  return [StatusCodes.OK, {}];
};
