import { KyselyCore, PrismaTransaction } from "@recipiece/database";
import { MealPlanItemJobDataSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { mealPlanItemQueue } from "../../../job";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { JobType } from "../../../util/constant";
import { NotFoundError } from "../../../util/error";
import { getMealPlanByIdQuery } from "../query";

export const updateItemForMealPlan = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const user = request.user;
  const { id: mealPlanItemId, meal_plan_id, ...restMealPlanItem } = request.body;

  const mealPlan = await getMealPlanByIdQuery(tx, user, meal_plan_id).executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${meal_plan_id} not found`,
      },
    ];
  }

  try {
    const item = await tx.mealPlanItem.update({
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

    // kill any existing meal plan jobs for this meal plan item
    await tx.$kysely
      .deleteFrom("side_jobs")
      .where((eb) => {
        return eb.or([eb("side_jobs.type", "=", JobType.MEAL_PLAN_ITEM), eb("side_jobs.type", "=", JobType.MEAL_PLAN_NOTIFICATION)]);
      })
      .where(() => {
        return KyselyCore.sql`side_jobs.job_data->>'meal_plan_item_id' = ${item.id}`;
      })
      .execute();

    // create a new job to process this item
    const job = await tx.sideJob.create({
      data: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: <MealPlanItemJobDataSchema>{
          meal_plan_id: mealPlan.id,
          meal_plan_item_id: item.id,
        },
        user_id: user.id,
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
  } catch (err: any) {
    if (err?.code === "P2025") {
      throw new NotFoundError(`Meal plan item ${mealPlanItemId} not found`);
    }
    throw err;
  }
};
