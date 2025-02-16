import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

/**
 * Delete a meal plan.
 * Also deletes any notification jobs associated with the meal plan.
 */
export const deleteMealPlan = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const { id: userId } = request.user;
  const { id: mealPlanId } = request.params;

  const mealPlan = await tx.mealPlan.findFirst({
    where: {
      user_id: userId,
      id: +mealPlanId,
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

  await tx.mealPlan.delete({
    where: {
      id: mealPlan.id,
    },
  });
  await tx.sideJob.deleteMany({
    where: {
      job_data: {
        path: ["meal_plan_id"],
        equals: mealPlan.id,
      },
    },
  });

  return [StatusCodes.OK, {}];
};
