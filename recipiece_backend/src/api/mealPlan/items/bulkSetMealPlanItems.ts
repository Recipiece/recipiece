import { MealPlanItem, mealPlanSharesWithMemberships, prisma } from "@recipiece/database";
import { BulkSetMealPlanItemsRequestSchema, BulkSetMealPlanItemsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const bulkSetMealPlanItems = async (request: AuthenticatedRequest<BulkSetMealPlanItemsRequestSchema>): ApiResponse<BulkSetMealPlanItemsResponseSchema> => {
  const mealPlanId = +request.params.id;
  const user = request.user;

  const mealPlan = await prisma.$kysely
    .selectFrom("meal_plans")
    .selectAll("meal_plans")
    .where((eb) => {
      return eb.and([
        eb("meal_plans.id", "=", mealPlanId),
        eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]),
      ]);
    })
    .executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal Plan ${mealPlanId} not found`,
      },
    ];
  }

  const { create: itemsToCreate, update: itemsToUpdate, delete: itemsToDelete } = request.body;

  try {
    const response = await prisma.$transaction(async (tx) => {
      if (itemsToDelete.length > 0) {
        await tx.mealPlanItem.deleteMany({
          where: {
            meal_plan_id: mealPlan.id,
            id: {
              in: itemsToDelete.map((item) => item.id),
            },
          },
        });
      }

      let created: MealPlanItem[] = [];
      if (itemsToCreate.length > 0) {
        created = await tx.mealPlanItem.createManyAndReturn({
          data: itemsToCreate.map((item) => {
            return {
              ...item,
              meal_plan_id: mealPlan.id,
            };
          }),
          include: {
            recipe: true,
          }
        });
      }

      let updated: MealPlanItem[] = [];
      if (itemsToUpdate.length > 0) {
        const updatePromises = itemsToUpdate.map((item) => {
          return tx.mealPlanItem.update({
            where: {
              meal_plan_id: mealPlan.id,
              id: item.id,
            },
            data: {
              ...(item ?? {}),
            },
            include: {
              recipe: true,
            }
          });
        });
        updated = await Promise.all(updatePromises);
      }

      return {
        created: created,
        updated: updated,
      }
    });

    return [StatusCodes.OK, response];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to bulk set meal plan items",
      },
    ];
  }
};
