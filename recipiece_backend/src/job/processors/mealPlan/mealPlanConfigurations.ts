import { KyselyCore, prisma } from "@recipiece/database";
import { MealPlanItemJobDataSchema, YMealPlanConfigurationJobDataSchema } from "@recipiece/types";
import { Job } from "bullmq";
import { DateTime } from "luxon";
import { JobType } from "../../../util/constant";
import { mealPlanItemQueue } from "../../queues";

export const processMealPlanConfigurationUpdate = async (job: Job) => {
  await prisma.$transaction(async (tx) => {
    const sideJob = await tx.sideJob.findFirst({
      where: {
        id: job.id!,
      },
    });
    if (!sideJob) {
      console.log(`side job ${job.id} not found`);
      return;
    }

    const jobData = YMealPlanConfigurationJobDataSchema.cast(sideJob.job_data);

    const mealPlan = await tx.mealPlan.findFirst({
      where: {
        id: jobData.meal_plan_id,
      },
    });

    if (!mealPlan) {
      console.log(`meal plan ${jobData.meal_plan_id} not found`);
      return;
    }

    // kill any active meal plan item jobs related to this meal plan
    await tx.$kysely
      .deleteFrom("side_jobs")
      .where((eb) => {
        return eb.or([
          eb("side_jobs.type", "=", JobType.MEAL_PLAN_ITEM),
          eb("side_jobs.type", "=", JobType.MEAL_PLAN_NOTIFICATION),
        ]);
      })
      .where(() => {
        return KyselyCore.sql`(side_jobs.job_data->>'meal_plan_id')::int = ${mealPlan.id}`;
      })
      .execute();

    // process all future meal plan items
    const mealPlanItems = await tx.mealPlanItem.findMany({
      where: {
        meal_plan_id: mealPlan.id,
        recipe_id: {
          not: null,
        },
        start_date: {
          gt: DateTime.utc().toJSDate(),
        },
      },
    });

    const jobs = await tx.sideJob.createManyAndReturn({
      data: mealPlanItems.map((item) => {
        return {
          user_id: mealPlan.user_id,
          type: JobType.MEAL_PLAN_ITEM,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_id: mealPlan.id,
            meal_plan_item_id: item.id,
          },
        };
      }),
    });

    await Promise.all(
      jobs.map((job) => {
        return mealPlanItemQueue.add(job.id, {}, { jobId: job.id });
      })
    );
  });
};
