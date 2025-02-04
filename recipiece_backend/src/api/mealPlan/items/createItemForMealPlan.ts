import { mealPlanSharesWithMemberships, prisma } from "@recipiece/database";
import { CreateMealPlanItemRequestSchema, MealPlanItemJobDataSchema, MealPlanItemSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { mealPlanItemQueue } from "../../../job";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { JobType } from "../../../util/constant";

export const createItemForMealPlan = async (request: AuthenticatedRequest<CreateMealPlanItemRequestSchema>): ApiResponse<MealPlanItemSchema> => {
  const user = request.user;
  const { meal_plan_id, ...restMealPlanItem } = request.body;

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

  // check the recipe ownership
  if (restMealPlanItem.recipe_id) {
    const ownedRecipe = await prisma.$kysely
      .selectFrom("recipes")
      .select("recipes.id")
      .where("recipes.user_id", "=", user.id)
      .where("recipes.id", "=", restMealPlanItem.recipe_id)
      .executeTakeFirst();
    if (!ownedRecipe) {
      const sharedRecipe = await prisma.$kysely
        .selectFrom("recipe_shares")
        .select("recipe_shares.recipe_id")
        .leftJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "recipe_shares.user_kitchen_membership_id")
        .where("user_kitchen_memberships.destination_user_id", "=", user.id)
        .where((eb) => {
          return eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
        })
        .where("recipe_shares.recipe_id", "=", restMealPlanItem.recipe_id)
        .executeTakeFirst();

      if (!sharedRecipe) {
        return [
          StatusCodes.NOT_FOUND,
          {
            message: "User does not have access to provided recipe",
          },
        ];
      }
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // create the item
      const item = await tx.mealPlanItem.create({
        data: {
          ...restMealPlanItem,
          meal_plan_id: mealPlan.id,
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

      // create a job for processing the item
      const job = await tx.sideJob.create({
        data: {
          type: JobType.MEAL_PLAN_ITEM,
          user_id: user.id,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_id: mealPlan.id,
            meal_plan_item_id: item.id,
          },
        },
      });

      // enqueue the job
      await mealPlanItemQueue.add(
        job.id,
        {},
        {
          jobId: job.id,
          delay: 10000,
        }
      );

      return [StatusCodes.OK, item];
    });
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to create meal plan item",
      },
    ];
  }
};
