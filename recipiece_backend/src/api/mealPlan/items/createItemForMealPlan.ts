import { PrismaTransaction } from "@recipiece/database";
import { CreateMealPlanItemRequestSchema, MealPlanItemJobDataSchema, MealPlanItemSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { mealPlanItemQueue } from "../../../job";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { JobType } from "../../../util/constant";
import { getMealPlanByIdQuery } from "../query";
import { getRecipeByIdQuery } from "../../recipe/query";

export const createItemForMealPlan = async (request: AuthenticatedRequest<CreateMealPlanItemRequestSchema>, tx: PrismaTransaction): ApiResponse<MealPlanItemSchema> => {
  const user = request.user;
  const { meal_plan_id, ...restMealPlanItem } = request.body;

  const mealPlan = await getMealPlanByIdQuery(tx, user, meal_plan_id).executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${meal_plan_id} not found`,
      },
    ];
  }

  if (restMealPlanItem.recipe_id) {
    const recipe = await getRecipeByIdQuery(tx, user, restMealPlanItem.recipe_id).executeTakeFirst();
    if (!recipe) {
      return [
        StatusCodes.NOT_FOUND,
        {
          message: "User does not have access to provided recipe",
        },
      ];
    }
  }

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
};
