import { KyselyCore, MealPlanItem, PrismaTransaction, User } from "@recipiece/database";
import {
  BulkSetMealPlanItemsRequestSchema,
  BulkSetMealPlanItemsResponseSchema,
  MealPlanItemJobDataSchema,
} from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { mealPlanItemQueue } from "../../../job";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { JobType } from "../../../util/constant";
import { getRecipeByIdQuery } from "../../recipe/query";
import { getMealPlanByIdQuery } from "../query";

export const bulkSetMealPlanItems = async (
  request: AuthenticatedRequest<BulkSetMealPlanItemsRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<BulkSetMealPlanItemsResponseSchema> => {
  const mealPlanId = +request.params.id;
  const user = request.user;

  const mealPlan = await getMealPlanByIdQuery(tx, user, mealPlanId).executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal Plan ${mealPlanId} not found`,
      },
    ];
  }

  const { create: itemsToCreate, update: itemsToUpdate, delete: itemsToDelete } = request.body;

  const createRecipeIds: number[] = itemsToCreate.filter((item) => !!item.recipe_id).map((item) => item.recipe_id!);
  const updateRecipeIds: number[] = itemsToUpdate.filter((item) => !!item.recipe_id).map((item) => item.recipe_id!);
  const allRecipeIds = new Set<number>([...createRecipeIds, ...updateRecipeIds]);

  if (allRecipeIds.size > 0) {
    const allFoundRecipes = await Promise.all(
      [...allRecipeIds].map((recipeId) => {
        return getRecipeByIdQuery(tx, user, recipeId).executeTakeFirst();
      })
    );
    if (allFoundRecipes.length !== allRecipeIds.size) {
      return [
        StatusCodes.NOT_FOUND,
        {
          message: "User does not have access to all recipes",
        },
      ];
    }
  }

  if (itemsToDelete.length > 0) {
    // delete the meal plan items
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
    // create the new items
    created = await tx.mealPlanItem.createManyAndReturn({
      data: itemsToCreate.map((item) => {
        return {
          ...item,
          meal_plan_id: mealPlan.id,
        };
      }),
      include: {
        recipe: true,
      },
    });
    // create jobs to process these items
    const createJobs = await tx.sideJob.createManyAndReturn({
      data: created.map((createdItem) => {
        return {
          type: JobType.MEAL_PLAN_ITEM,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_id: mealPlan.id,
            meal_plan_item_id: createdItem.id,
          },
          user_id: user.id,
        };
      }),
    });
    // enqueue the jobs
    await Promise.all(
      createJobs.map((job) => {
        return mealPlanItemQueue.add(job.id, {}, { jobId: job.id, delay: 10000 });
      })
    );
  }

  let updated: MealPlanItem[] = [];
  if (itemsToUpdate.length > 0) {
    // update the items
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
        },
      });
    });
    updated = await Promise.all(updatePromises);
    // kill any existing jobs for these updated records
    const updatedIds = updated.map((item) => item.id);
    await tx.$kysely
      .deleteFrom("side_jobs")
      .where((eb) => {
        return eb.or([
          eb("side_jobs.type", "=", JobType.MEAL_PLAN_ITEM),
          eb("side_jobs.type", "=", JobType.MEAL_PLAN_NOTIFICATION),
        ]);
      })
      .where(() => {
        return KyselyCore.sql`(side_jobs.job_data->>'meal_plan_item_id')::int = any(${updatedIds})`;
      })
      .execute();

    // create jobs to process the update items
    const updateJobs = await tx.sideJob.createManyAndReturn({
      data: updated.map((updatedItem) => {
        return {
          type: JobType.MEAL_PLAN_ITEM,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_id: mealPlan.id,
            meal_plan_item_id: updatedItem.id,
          },
          user_id: user.id,
        };
      }),
    });
    // enqueue the created jobs
    await Promise.all(
      updateJobs.map((job) => {
        return mealPlanItemQueue.add(job.id, {}, { jobId: job.id, delay: 10000 });
      })
    );
  }

  return [
    StatusCodes.OK,
    {
      created: created,
      updated: updated,
    },
  ];
};
