import { KyselySql, prisma } from "@recipiece/database";
import { MealPlanConfigurationSchema, YMealPlanConfigurationSchema } from "@recipiece/types";
import { Job } from "bullmq";
import Fraction from "fraction.js";
import { DateTime } from "luxon";
import { mealPlanNotificationsQueue } from "../queues";
import { MealPlanNotificationData } from "../data";

/**
 * Relies on spec from
 * https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods
 */
const enqueueThawingNotifications = async (mealPlanId: number, config: MealPlanConfigurationSchema) => {
  if (!!config.meats?.preferred_thawing_method && config.meats?.send_thawing_notification) {
    const thawingMethod = config.meats.preferred_thawing_method;

    // we'll only send notifications if you're not microwaving stuff, since that's happening at the time of cooking anyways.
    if (thawingMethod !== "microwave") {
      // look ahead at the meal plan for any recipes with ingredients that are a meat and setup a future job to send a push notification to the user
      const now = DateTime.utc();
      const futureItemsWithMeat = await prisma.$kysely
        .selectFrom("recipe_ingredients")
        .leftJoin("recipes", "recipes.id", "recipe_ingredients.recipe_id")
        .leftJoin("meal_plan_items", "meal_plan_items.recipe_id", "recipes.id")
        .select((_) => {
          return ["recipe_ingredients.name", "recipe_ingredients.amount", "recipe_ingredients.unit", "meal_plan_items.start_date", "meal_plan_items.id"];
        })
        .where("meal_plan_items.meal_plan_id", "=", mealPlanId)
        .where("meal_plan_items.recipe_id", "is not", null)
        .where("meal_plan_items.start_date", ">", now.toJSDate())
        .where(() => {
          return KyselySql`
          lower(recipe_ingredients.name) similar to '%(chicken|beef|steak|pork|meat|lamb|venison|rabbit|deer|duck|goat|fish|mutton|veal|bison)%'
        `;
        })
        .execute();

      futureItemsWithMeat.forEach(async (item) => {
        const jobId = `mealPlanNotification:${mealPlanId}:meatTimer:${item.id}`;
        const itemStartDate = DateTime.fromJSDate(item.start_date!).toUTC();

        let delay: DateTime;
        // @TODO -- make this better, probably pull in convert library?
        const isWeightyUnit = item.unit && item.unit.toLowerCase() in ["lb", "lbs", "pound", "pounds"];
        if (item.amount && isWeightyUnit) {
          const fractionalAmount = new Fraction(item.amount).valueOf();
          // if we know the item's weight then we can guesstimate based on the type of defrosting the user is doing
          if (thawingMethod === "refrigerator") {
            // assume at worst, a day per lb
            delay = itemStartDate.minus({ days: fractionalAmount });
          } else {
            // assume at worst, 30 mins per lb
            delay = itemStartDate.minus({ hours: fractionalAmount / 0.5 });
          }
        } else {
          if (thawingMethod === "refrigerator") {
            delay = itemStartDate.minus({ days: 1 });
          } else {
            delay = itemStartDate.minus({ hours: 3 });
          }
        }

        const delayMillis = delay.toMillis();

        if (delayMillis > 0) {
          await mealPlanNotificationsQueue.add(
            jobId,
            <MealPlanNotificationData>{
              meal_plan_id: mealPlanId,
              meal_plan_item_id: item.id,
              ingredient_name: item.name,
              ingredient_amount: item.amount,
              ingredient_unit: item.unit,
            },
            {
              delay: delayMillis,
            }
          );
        }
      });
    }
  }
};

export const processMealPlanConfigurationUpdate = async (job: Job) => {
  const { meal_plan_id } = job.data;
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: meal_plan_id,
    },
  });

  if (!mealPlan) {
    console.log(`Meal plan ${meal_plan_id} not found!`);
    return;
  }

  // kill any active notification jobs for this meal plan
  const jobsToKill: Job[] = (await mealPlanNotificationsQueue.getJobs(["waiting", "delayed"])).filter((job) => (<string>job.id).startsWith(`mealPlanNotification:${mealPlan.id}`));
  jobsToKill.forEach(async (job) => {
    try {
      await job.remove();
    } catch (err) {
      console.error(err);
    }
  });

  const parsedConfig = YMealPlanConfigurationSchema.cast(mealPlan.configuration);
  await enqueueThawingNotifications(mealPlan.id, parsedConfig);
};
