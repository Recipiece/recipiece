import { prisma } from "@recipiece/database";
import { generateMealPlan, generateMealPlanItem, generateRecipe, generateRecipeIngredient } from "@recipiece/test";
import { MealPlanConfigurationSchema, MealPlanNotificationJobDataSchema } from "@recipiece/types";
import { Job } from "bullmq";
import { processMealPlanNotification } from "../../../../src/job/processors";
import { JobType } from "../../../../src/util/constant";

describe("Meal Plan Notification Jobs", () => {
  it("should send a push notification", async () => {
    const mealPlan = await generateMealPlan({
      configuration: (<MealPlanConfigurationSchema>{
        meats: {
          preferred_thawing_method: "refrigerator",
          send_thawing_notification: true,
        },
      }) as any,
    });
    const recipe = await generateRecipe({ user_id: mealPlan.user_id });
    const ingredient = await generateRecipeIngredient({
      recipe_id: recipe.id,
    });

    const mealPlanItem = await generateMealPlanItem({
      meal_plan_id: mealPlan.id,
      recipe_id: recipe.id,
    });

    await prisma.userPushNotificationSubscription.create({
      data: {
        user_id: mealPlan.user_id,
        subscription_data: {},
        device_id: "",
      }
    });

    const job = await prisma.sideJob.create({
      data: {
        user_id: mealPlan.user_id,
        type: JobType.MEAL_PLAN_NOTIFICATION,
        job_data: <MealPlanNotificationJobDataSchema>{
          meal_plan_id: mealPlan.id,
          meal_plan_item_id: mealPlanItem.id,
          ingredient_name: ingredient.name,
          ingredient_amount: ingredient.amount,
          ingredient_unit: ingredient.unit,
        },
      },
    });

    await processMealPlanNotification({ id: job.id } as Job);
  });
});
