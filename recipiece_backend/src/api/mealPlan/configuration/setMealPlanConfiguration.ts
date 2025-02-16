import { KyselyCore, mealPlanSharesWithMemberships, PrismaTransaction } from "@recipiece/database";
import { MealPlanConfigurationJobDataSchema, MealPlanConfigurationSchema, YMealPlanConfigurationSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { mealPlanConfigurationQueue } from "../../../job";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { JobType } from "../../../util/constant";

/**
 * Set the configuration for a meal plan.
 * This will also set a task in the meal plan configurations queue that will scan any and all future meal plan
 * items in the meal plan and take the appropriate actions based on the configuration.
 */
export const setMealPlanConfiguration = async (request: AuthenticatedRequest<MealPlanConfigurationSchema>, tx: PrismaTransaction): ApiResponse<MealPlanConfigurationSchema> => {
  const user = request.user;
  const mealPlanId = +request.params.id!;
  const configuration = request.body;

  const query = tx.$kysely
    .selectFrom("meal_plans")
    .selectAll("meal_plans")
    .where((eb) => {
      return eb.and([
        eb("meal_plans.id", "=", mealPlanId),
        eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]),
      ]);
    });

  const mealPlan = await query.executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal Plan ${mealPlanId} not found`,
      },
    ];
  }

  const updated = await tx.mealPlan.update({
    where: {
      id: mealPlan.id,
    },
    data: {
      configuration: { ...(configuration ?? {}) },
    },
  });

  // kill any meal plan config jobs that are pending
  await tx.$kysely
    .deleteFrom("side_jobs")
    .where("side_jobs.type", "=", JobType.MEAL_PLAN_CONFIGURATION)
    .where(() => {
      return KyselyCore.sql`(side_jobs.job_data->>'meal_plan_id')::int = ${mealPlan.id}`;
    })
    .execute();

  // enqueue a new config job
  const job = await tx.sideJob.create({
    data: {
      user_id: user.id,
      type: JobType.MEAL_PLAN_CONFIGURATION,
      job_data: <MealPlanConfigurationJobDataSchema>{
        meal_plan_id: mealPlan.id,
      },
    },
  });

  await mealPlanConfigurationQueue.add(job.id, {}, { jobId: job.id });

  return [StatusCodes.OK, YMealPlanConfigurationSchema.cast(updated.configuration)];
};
