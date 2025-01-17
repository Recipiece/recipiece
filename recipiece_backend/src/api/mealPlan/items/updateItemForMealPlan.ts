import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const updateItemForMealPlan = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const { id: userId } = request.user;
  const { id: mealPlanItemId, meal_plan_id, ...restMealPlanItem } = request.body;

  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: meal_plan_id,
      user_id: userId,
    },
  });

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${meal_plan_id} not found`,
      },
    ];
  }

  try {
    const mealPlanItem = await prisma.mealPlanItem.update({
      data: {
        ...restMealPlanItem,
      },
      where: {
        id: mealPlanItemId,
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: true,
          },
        },
      },
    });
    return [StatusCodes.OK, mealPlanItem];
  } catch (err: any) {
    if (err?.code === "P2025") {
      return [
        StatusCodes.NOT_FOUND,
        {
          message: `Meal plan item ${mealPlanItemId} not found`,
        },
      ];
    } else {
      console.error(err);
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Internal error",
        },
      ];
    }
  }
};
