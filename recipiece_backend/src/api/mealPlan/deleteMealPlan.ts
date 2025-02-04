import { prisma } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { JobType } from "../../util/constant";

/**
 * Delete a meal plan.
 * Also deletes any notification jobs associated with the meal plan.
 */
export const deleteMealPlan = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const { id: userId } = request.user;
  const { id: mealPlanId } = request.params;

  const mealPlan = await prisma.mealPlan.findFirst({
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

  try {
    await prisma.$transaction(async (tx) => {
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
    });
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to delete meal plan",
      },
    ];
  }
  return [StatusCodes.OK, {}];
};
