import { MealPlan, mealPlanSharesWithMemberships, prisma } from "@recipiece/database";
import { MealPlanConfigurationSchema, SetMealPlanConfigurationRequestSchema, YMealPlanConfigurationSchema } from "@recipiece/types";
import { Job } from "bullmq";
import { StatusCodes } from "http-status-codes";
import { mealPlanConfigurationQueue } from "../../../job";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

/**
 * Set the configuration for a meal plan.
 * This will also set a task in the meal plan configurations queue that will scan any and all future meal plan
 * items in the meal plan and take the appropriate actions based on the configuration.
 */
export const setMealPlanConfiguration = async (request: AuthenticatedRequest<SetMealPlanConfigurationRequestSchema>): ApiResponse<MealPlanConfigurationSchema> => {
  const user = request.user;
  const mealPlanId = +request.params.id!;
  const { configuration } = request.body;

  const query = prisma.$kysely
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

  let updatedMealPlan: MealPlan;
  try {
    updatedMealPlan = await prisma.mealPlan.update({
      where: {
        id: mealPlan.id,
      },
      data: {
        configuration: { ...(configuration ?? {}) },
      },
    });
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to update meal plan",
      },
    ];
  }

  try {
    const jobId = `mealPlanConfiguration:${user.id}:${mealPlan.id}`;
    const existingJob: Job = await mealPlanConfigurationQueue.getJob(jobId);
    if (existingJob) {
      const isActive = await existingJob.isActive();
      if (!isActive) {
        existingJob.remove();
      }
    }

    await mealPlanConfigurationQueue.add(
      jobId,
      {
        meal_plan_id: mealPlan.id,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        jobId: jobId,
      }
    );
  } catch (err) {
    console.error(err);
    // we don't fail here, they'll just be out of luck :shrug:
  }

  return [StatusCodes.OK, YMealPlanConfigurationSchema.cast(updatedMealPlan.configuration)];
};
