import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { prisma } from "../../../database";
import { Prisma } from "@prisma/client";

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
