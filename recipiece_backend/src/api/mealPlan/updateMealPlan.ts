import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { MealPlanSchema, UpdateMealPlanRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateMealPlan = async (
  request: AuthenticatedRequest<UpdateMealPlanRequestSchema>
): ApiResponse<MealPlanSchema> => {
  const { id: userId } = request.user;
  const { id: mealPlanId, ...restMealPlan } = request.body;

  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      user_id: userId,
      id: mealPlanId,
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

  const anythingToUpdate = !!Object.values(restMealPlan).find((v) => !!v);
  if (anythingToUpdate) {
    const updatedMealPlan = await prisma.mealPlan.update({
      where: {
        id: mealPlanId,
      },
      // @ts-ignore
      data: {
        ...restMealPlan,
      },
    });
    return [StatusCodes.OK, updatedMealPlan];
  } else {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Meal plan update must have at least one field to update",
      },
    ];
  }
};
