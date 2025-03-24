import { convertIngredientInDifferentCategory, convertIngredientInSameCategory, getMatchingUnitConverter } from "@recipiece/conversion";
import { KnownIngredient, MealPlanItem, PrismaTransaction, RecipeIngredient } from "@recipiece/database";
import { MealPlanConfigurationSchema, MealPlanNotificationJobDataSchema } from "@recipiece/types";
import { search as fuzzySearch } from "fast-fuzzy";
import Fraction from "fraction.js";
import { DateTime, Duration } from "luxon";
import { JobType } from "../../../../util/constant";
import { mealPlanNotificationsQueue } from "../../../queues";

export const MEAT_LIKE_INGREDIENTS = ["chicken", "beef", "steak", "pork", "meat", "lamb", "venison", "rabbit", "deer", "duck", "goat", "fish", "mutton", "veal", "bison"];

/**
 * Processes the provided ingredients and enqueue a meal plan notification
 * to set out for the meats in the associated recipe for thawing.
 *
 * The caller of this function should ensure that the list of ingredients
 * 1. Corresponds to a single recipe.
 * 2. Are only the meat-centric ingredients.
 */
export const processMeatThawing = async (
  transaction: PrismaTransaction,
  userId: number,
  mealPlanItem: MealPlanItem,
  config: MealPlanConfigurationSchema,
  ingredients: RecipeIngredient[],
  knownIngredients: KnownIngredient[]
) => {
  const itemStartDate = DateTime.fromJSDate(mealPlanItem.start_date!).toUTC();
  const knownIngredientNames = knownIngredients.map((ki) => ki.ingredient_name);

  const thawingMethod = config.meats?.preferred_thawing_method;
  const sendNotification = config.meats?.send_thawing_notification;

  if (!sendNotification) {
    console.log("meal plan config does not want to send meat thawing notifications, skipping processing");
    return;
  }

  if (thawingMethod !== "refrigerator" && thawingMethod !== "cold_water") {
    console.log(`thawing method is set to ${thawingMethod}, skipping processing`);
    return;
  }

  const heaviestToLightestLbsIngredients = ingredients
    .filter((ing) => {
      return !!ing.unit && !!ing.amount;
    })
    .map((ing) => {
      try {
        const matchingUnitConverter = getMatchingUnitConverter(ing);
        if (matchingUnitConverter.unit_category === "mass") {
          return {
            ...ing,
            amount: convertIngredientInSameCategory(ing, "lb"),
          };
        } else {
          // attempt to find a known ingredient for this ingredient, and then cast it over
          const matches = fuzzySearch(ing.name, knownIngredientNames);
          if (matches.length > 0) {
            const match = knownIngredients.find((ki) => ki.ingredient_name === matches[0]);
            return {
              ...ing,
              amount: convertIngredientInDifferentCategory(ing, match!, "lb"),
            };
          }
        }
      } catch (err) {
        console.error(`failed to convert ingredient name=${ing.name}, unit=${ing.unit}, amount=${ing.amount} to targetUnit=lb\n`, err);
        return;
      }
    })
    .filter((ing) => !!ing)
    .sort((a, b) => b.amount - a.amount);

  if (heaviestToLightestLbsIngredients.length > 0) {
    const worstCaseIngredient = heaviestToLightestLbsIngredients[0];
    const ceiledIngredientAmount = Math.ceil(worstCaseIngredient.amount);
    let delayDate: DateTime;
    let delayDuration: Duration;
    if (thawingMethod === "refrigerator") {
      // assume at worst, a day per lb
      delayDate = itemStartDate.minus({ days: ceiledIngredientAmount });
      //calculate the diff here rather than when we're rounding it out
      delayDuration = delayDate.diff(DateTime.utc());
      // set the hour of the date to 0800 so as to not spam the user at like 2 AM or something.
      delayDate = DateTime.fromObject({
        hour: 8,
        minute: 0,
        second: 0,
        day: delayDate.day,
        month: delayDate.month,
        year: delayDate.year,
      });
    } else {
      // assume at worst, 30 mins per lb
      delayDate = itemStartDate.minus({ hours: ceiledIngredientAmount / 0.5 });
      delayDuration = delayDate.diff(DateTime.utc());
    }

    let shouldEnqueueNotification = false;
    if (thawingMethod === "refrigerator") {
      shouldEnqueueNotification = delayDuration.as("days") > 1;
    } else if (thawingMethod === "cold_water") {
      shouldEnqueueNotification = delayDuration.as("hours") > 1;
    }

    if (shouldEnqueueNotification) {
      const delayMillis = delayDuration.as("milliseconds");
      const originalIngredient = ingredients.find((ing) => ing.id === worstCaseIngredient.id)!;

      const notificationData: MealPlanNotificationJobDataSchema = {
        meal_plan_id: mealPlanItem.meal_plan_id,
        meal_plan_item_id: mealPlanItem.id,
        ingredient_name: originalIngredient.name,
        ingredient_amount: new Fraction(originalIngredient.amount!).toString(),
        ingredient_unit: originalIngredient.unit!,
      };
      const notificationJob = await transaction.sideJob.create({
        data: {
          user_id: userId,
          type: JobType.MEAL_PLAN_NOTIFICATION,
          job_data: { ...notificationData },
        },
      });
      await mealPlanNotificationsQueue.add(
        notificationJob.id,
        {},
        {
          jobId: notificationJob.id,
          delay: delayMillis,
        }
      );
    } else {
      console.log(`delay was calculated to be ${delayDuration.toHuman()}, not sending notification.`);
    }
  } else {
    console.log("No ingredients left after processing, nothing to send.");
  }
};
