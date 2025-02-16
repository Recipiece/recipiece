import { KyselyCore, MealPlanItem, mealPlanSharesWithMemberships, PrismaTransaction } from "@recipiece/database";
import { BulkSetMealPlanItemsRequestSchema, BulkSetMealPlanItemsResponseSchema, MealPlanItemJobDataSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { mealPlanItemQueue } from "../../../job";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { JobType } from "../../../util/constant";

export const bulkSetMealPlanItems = async (
  request: AuthenticatedRequest<BulkSetMealPlanItemsRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<BulkSetMealPlanItemsResponseSchema> => {
  const mealPlanId = +request.params.id;
  const user = request.user;

  const mealPlan = await tx.$kysely
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

  const createRecipeIds: number[] = itemsToCreate.filter((item) => !!item.recipe_id).map((item) => item.recipe_id!);
  const updateRecipeIds: number[] = itemsToUpdate.filter((item) => !!item.recipe_id).map((item) => item.recipe_id!);
  const allRecipeIds = new Set<number>([...createRecipeIds, ...updateRecipeIds]);

  if (allRecipeIds.size > 0) {
    // we should find as many recipes as ids
    const ownedRecipes = await tx.$kysely
      .selectFrom("recipes")
      .select("recipes.id")
      .where("recipes.id", "in", [...allRecipeIds])
      .where("recipes.user_id", "=", user.id)
      .execute();
    if (ownedRecipes.length !== allRecipeIds.size) {
      // mkay, they don't own all the recipes they sent in, so check the shares
      const sharedRecipes = await tx.$kysely
        .selectFrom("recipe_shares")
        .select("recipe_shares.recipe_id")
        .leftJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "recipe_shares.user_kitchen_membership_id")
        .where("user_kitchen_memberships.destination_user_id", "=", user.id)
        .where((eb) => {
          return eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
        })
        .where("recipe_shares.recipe_id", "in", [...allRecipeIds])
        .execute();
      if (ownedRecipes.length + sharedRecipes.length !== allRecipeIds.size) {
        return [
          StatusCodes.NOT_FOUND,
          {
            message: "User does not have access to all recipes",
          },
        ];
      }
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
        return eb.or([eb("side_jobs.type", "=", JobType.MEAL_PLAN_ITEM), eb("side_jobs.type", "=", JobType.MEAL_PLAN_NOTIFICATION)]);
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
