import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

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

  await prisma.mealPlan.delete({
    where: {
      id: +mealPlanId,
    },
  });
  return [StatusCodes.OK, {}];
};
