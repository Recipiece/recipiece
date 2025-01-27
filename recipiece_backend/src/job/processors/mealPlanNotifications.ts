import { Job } from "bullmq";
import { MealPlanNotificationData } from "../data";
import { prisma } from "@recipiece/database";
import { YMealPlanConfigurationSchema } from "@recipiece/types";
import { sendMeatTimerNotification } from "../../util/pushNotification";

export const processMealPlanNotification = async (job: Job) => {
  const data: MealPlanNotificationData = job.data;
  const mealPlanItem = await prisma.mealPlanItem.findFirst({
    where: {
      id: data.meal_plan_item_id,
    },
    include: {
      meal_plan: true,
      recipe: true,
    }
  });

  if(!mealPlanItem) {
    console.log(`Meal plan item ${data.meal_plan_item_id} does not exist`);
    return;
  }

  if(!mealPlanItem.recipe) {
    console.log(`Meal plan item ${data.meal_plan_item_id} has no recipe attached`);
    return;
  }

  const pushNotificationSubscriptions = await prisma.userPushNotificationSubscription.findMany({
    where: {
      user_id: mealPlanItem.meal_plan.user_id,
    }
  });

  if(pushNotificationSubscriptions.length === 0) {
    console.log(`No push notifications configured for user ${mealPlanItem.meal_plan.user_id}`);
    return;
  }

  const mealPlanConfiguration = YMealPlanConfigurationSchema.cast(mealPlanItem.meal_plan.configuration);
  const thawingMethod = mealPlanConfiguration.meats?.preferred_thawing_method;

  let displayThawingMethod: string | undefined = undefined;
  if(thawingMethod === "refrigerator") {
    displayThawingMethod = "into the fridge";
  } else if (thawingMethod === "cold_water") {
    displayThawingMethod = "into cold water";
  }

  if(!displayThawingMethod) {
    console.log(`Unsupported thawing method ${thawingMethod} for meal plan ${mealPlanItem.meal_plan_id}`);
    return;
  }

  const message = `It's time to put the ${data.ingredient_name} for ${mealPlanItem.recipe.name} ${displayThawingMethod}.`;
  pushNotificationSubscriptions.forEach(async (subscription) => {
    await sendMeatTimerNotification(subscription, mealPlanItem.meal_plan, message);
  });
}
