import { StatusCodes } from "http-status-codes";
import { mealPlanSharesWithMemberships, prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const updateItemForMealPlan = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const user = request.user;
  const { id: mealPlanItemId, meal_plan_id, ...restMealPlanItem } = request.body;

  const mealPlan = await prisma.$kysely
      .selectFrom("meal_plans")
      .selectAll("meal_plans")
      .where((eb) => {
        return eb.and([
          eb("meal_plans.id", "=", meal_plan_id),
          eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]),
        ]);
      })
      .executeTakeFirst();

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
