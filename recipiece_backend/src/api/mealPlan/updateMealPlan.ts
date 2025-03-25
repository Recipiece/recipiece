import { PrismaTransaction } from "@recipiece/database";
import { MealPlanSchema, UpdateMealPlanRequestSchema, YMealPlanConfigurationSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateMealPlan = async (request: AuthenticatedRequest<UpdateMealPlanRequestSchema>, tx: PrismaTransaction): ApiResponse<MealPlanSchema> => {
  const { id: userId } = request.user;
  const { id: mealPlanId, ...restMealPlan } = request.body;

  const mealPlan = await tx.mealPlan.findFirst({
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
    const updatedMealPlan = await tx.mealPlan.update({
      where: {
        id: mealPlanId,
      },
      // @ts-expect-error prisma types suck
      data: {
        ...restMealPlan,
      },
    });
    return [
      StatusCodes.OK,
      {
        ...updatedMealPlan,
        configuration: YMealPlanConfigurationSchema.cast(updatedMealPlan.configuration),
      },
    ];
  } else {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Meal plan update must have at least one field to update",
      },
    ];
  }
};
