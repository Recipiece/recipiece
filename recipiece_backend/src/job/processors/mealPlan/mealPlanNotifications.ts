import { prisma } from "@recipiece/database";
import { YMealPlanConfigurationSchema, YMealPlanNotificationJobDataSchema } from "@recipiece/types";
import { Job } from "bullmq";
import { sendPushNotification } from "../../../util/pushNotification";

export const processMealPlanNotification = async (job: Job) => {
  await prisma.$transaction(async (tx) => {
    const sideJob = await tx.sideJob.findFirst({
      where: {
        id: job.id!,
      },
    });

    if (!sideJob) {
      console.log(`job ${job.id} not found`);
      return;
    }

    const jobData = YMealPlanNotificationJobDataSchema.cast(sideJob.job_data);

    const mealPlanItem = await tx.mealPlanItem.findFirst({
      where: {
        id: jobData.meal_plan_item_id,
      },
      include: {
        meal_plan: true,
        recipe: true,
      },
    });

    if (!mealPlanItem) {
      console.log(`Meal plan item ${jobData.meal_plan_item_id} does not exist`);
      return;
    }

    if (!mealPlanItem.recipe) {
      console.log(`Meal plan item ${jobData.meal_plan_item_id} has no recipe attached`);
      return;
    }

    const pushNotificationSubscriptions = await tx.userPushNotificationSubscription.findMany({
      where: {
        user_id: sideJob.user_id,
      },
    });

    if (pushNotificationSubscriptions.length === 0) {
      console.log(`No push notifications configured for user ${mealPlanItem.meal_plan.user_id}`);
      return;
    }

    const mealPlanConfiguration = YMealPlanConfigurationSchema.cast(mealPlanItem.meal_plan.configuration);
    if (mealPlanConfiguration.meats?.send_thawing_notification) {
      const thawingMethod = mealPlanConfiguration.meats?.preferred_thawing_method;

      let displayThawingMethod: string | undefined = undefined;
      if (thawingMethod === "refrigerator") {
        displayThawingMethod = "into the fridge";
      } else if (thawingMethod === "cold_water") {
        displayThawingMethod = "into cold water";
      }

      if (!displayThawingMethod) {
        console.log(`Unsupported thawing method ${thawingMethod} for meal plan ${mealPlanItem.meal_plan_id}`);
        return;
      }

      const message = `It's time to put the ${jobData.ingredient_name} for ${mealPlanItem.recipe.name} ${displayThawingMethod}.`;
      const notificationBody = {
        title: "Thawing Time!",
        body: message,
        type: "thawMeatTimer",
        data: { id: mealPlanItem.recipe_id },
        requiresInteraction: false,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        tag: `thawMeatTimer${mealPlanItem.id}`,
      };

      const pushPromises = pushNotificationSubscriptions.map(async (subscription) => {
        return await sendPushNotification(subscription, notificationBody);
      });
      await Promise.all(pushPromises);
    } else {
      console.log(`meal plan ${mealPlanItem.meal_plan_id} is not configured to send thawing notifications`);
      return;
    }
  });
};
