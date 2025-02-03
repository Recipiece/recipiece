import { prisma } from "@recipiece/database";
import { generateMealPlan, generateMealPlanItem, generateRecipe, generateRecipeIngredient } from "@recipiece/test";
import { MealPlanConfigurationSchema, MealPlanItemJobDataSchema } from "@recipiece/types";
import { Job } from "bullmq";
import { DateTime } from "luxon";
import { mealPlanNotificationsQueue } from "../../../../src/job";
import { processMealPlanItem } from "../../../../src/job/processors";
import { JobType } from "../../../../src/util/constant";

describe("Meal Plan Item Jobs", () => {
  let addNotificationSpy: jest.SpyInstance;

  beforeEach(() => {
    addNotificationSpy = jest.spyOn(mealPlanNotificationsQueue, "add");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Meat Thawing", () => {
    it("should enqueue a notification for the heaviest ingredient by lbs for refrigeration", async () => {
      const recipe = await generateRecipe();
      const chickenIngredient = await generateRecipeIngredient({
        recipe_id: recipe.id,
        name: "Chicken",
        amount: "2.4",
        unit: "cups",
      });
      const beefIngredient = await generateRecipeIngredient({
        recipe_id: recipe.id,
        name: "BeEf",
        amount: "2",
        unit: "lbs",
      });
      await generateRecipeIngredient({
        recipe_id: recipe.id,
        name: "asparagus",
        amount: "4",
        unit: "oz",
      });

      const mealPlan = await generateMealPlan({
        configuration: (<MealPlanConfigurationSchema>{
          meats: {
            send_thawing_notification: true,
            preferred_thawing_method: "refrigerator",
          },
        }) as any,
        user_id: recipe.user_id,
      });

      const meatyMealPlanItem = await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        recipe_id: recipe.id,
        start_date: DateTime.utc().plus({ days: 4 }).toJSDate(),
      });

      const itemJob = await prisma.sideJob.create({
        data: {
          type: JobType.MEAL_PLAN_ITEM,
          user_id: mealPlan.user_id,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_item_id: meatyMealPlanItem.id,
            meal_plan_id: mealPlan.id,
          },
        },
      });

      await processMealPlanItem({
        name: itemJob.id,
        id: itemJob.id,
      } as Job);

      const job = await prisma.sideJob.findFirst({
        where: {
          type: JobType.MEAL_PLAN_NOTIFICATION,
          job_data: {
            path: ["meal_plan_item_id"],
            equals: meatyMealPlanItem.id,
          },
        },
      });
      expect(job).toBeTruthy();
      expect(addNotificationSpy).toHaveBeenCalled();
    });

    it("should do nothing if there are no meaty ingredients", async () => {
      const recipe = await generateRecipe();
      await generateRecipeIngredient({
        recipe_id: recipe.id,
        name: "asparagus",
        amount: "4",
        unit: "oz",
      });

      const mealPlan = await generateMealPlan({
        configuration: (<MealPlanConfigurationSchema>{
          meats: {
            send_thawing_notification: true,
            preferred_thawing_method: "refrigerator",
          },
        }) as any,
        user_id: recipe.user_id,
      });

      const meatyMealPlanItem = await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        recipe_id: recipe.id,
        start_date: DateTime.utc().plus({ days: 4 }).toJSDate(),
      });

      const itemJob = await prisma.sideJob.create({
        data: {
          type: JobType.MEAL_PLAN_ITEM,
          user_id: mealPlan.user_id,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_item_id: meatyMealPlanItem.id,
            meal_plan_id: mealPlan.id,
          },
        },
      });

      const enqueuedData = await processMealPlanItem({
        name: itemJob.id,
        id: itemJob.id,
      } as Job);

      expect(enqueuedData).toBeFalsy();

      const job = await prisma.sideJob.findFirst({
        where: {
          type: JobType.MEAL_PLAN_NOTIFICATION,
          job_data: {
            path: ["meal_plan_id"],
            equals: mealPlan.id,
          },
        },
      });
      expect(job).toBeFalsy();
      expect(addNotificationSpy).not.toHaveBeenCalled();
    });

    it("should do nothing if the meal plan item does not contain a recipe", async () => {
      const mealPlan = await generateMealPlan({
        configuration: (<MealPlanConfigurationSchema>{
          meats: {
            send_thawing_notification: true,
            preferred_thawing_method: "refrigerator",
          },
        }) as any,
      });

      const meatyMealPlanItem = await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        freeform_content: "asdfqwer",
        start_date: DateTime.utc().plus({ days: 4 }).toJSDate(),
      });

      const itemJob = await prisma.sideJob.create({
        data: {
          type: JobType.MEAL_PLAN_ITEM,
          user_id: mealPlan.user_id,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_item_id: meatyMealPlanItem.id,
            meal_plan_id: mealPlan.id,
          },
        },
      });

      const enqueuedData = await processMealPlanItem({
        name: itemJob.id,
        id: itemJob.id,
      } as Job);

      expect(enqueuedData).toBeFalsy();
      expect(addNotificationSpy).not.toHaveBeenCalled();
    });

    it("should not add a notification when the thawing method is cold_water the item start date is before an hour from now", async () => {
      const recipe = await generateRecipe();
      await generateRecipeIngredient({
        recipe_id: recipe.id,
        name: "Chicken",
        amount: "2.4",
        unit: "cups",
      });

      const mealPlan = await generateMealPlan({
        configuration: (<MealPlanConfigurationSchema>{
          meats: {
            send_thawing_notification: true,
            preferred_thawing_method: "cold_water",
          },
        }) as any,
        user_id: recipe.user_id,
      });

      const meatyMealPlanItem = await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        recipe_id: recipe.id,
        start_date: DateTime.utc().plus({ minutes: 10 }).toJSDate(),
      });

      const itemJob = await prisma.sideJob.create({
        data: {
          type: JobType.MEAL_PLAN_ITEM,
          user_id: mealPlan.user_id,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_item_id: meatyMealPlanItem.id,
            meal_plan_id: mealPlan.id,
          },
        },
      });

      await processMealPlanItem({
        name: itemJob.id,
        id: itemJob.id,
      } as Job);

      const job = await prisma.sideJob.findFirst({
        where: {
          type: JobType.MEAL_PLAN_NOTIFICATION,
          job_data: {
            path: ["meal_plan_item_id"],
            equals: meatyMealPlanItem.id,
          },
        },
      });
      expect(job).toBeFalsy();
      expect(addNotificationSpy).not.toHaveBeenCalled();
    });

    it("should not add a notification when the thawing method is refrigerator the item start date is before a day from now", async () => {
      const recipe = await generateRecipe();
      await generateRecipeIngredient({
        recipe_id: recipe.id,
        name: "Chicken",
        amount: "2.4",
        unit: "cups",
      });

      const mealPlan = await generateMealPlan({
        configuration: (<MealPlanConfigurationSchema>{
          meats: {
            send_thawing_notification: true,
            preferred_thawing_method: "cold_water",
          },
        }) as any,
        user_id: recipe.user_id,
      });

      const meatyMealPlanItem = await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        recipe_id: recipe.id,
        start_date: DateTime.utc().plus({ hours: 12 }).toJSDate(),
      });

      const itemJob = await prisma.sideJob.create({
        data: {
          type: JobType.MEAL_PLAN_ITEM,
          user_id: mealPlan.user_id,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_item_id: meatyMealPlanItem.id,
            meal_plan_id: mealPlan.id,
          },
        },
      });

      await processMealPlanItem({
        name: itemJob.id,
        id: itemJob.id,
      } as Job);

      const job = await prisma.sideJob.findFirst({
        where: {
          type: JobType.MEAL_PLAN_NOTIFICATION,
          job_data: {
            path: ["meal_plan_item_id"],
            equals: meatyMealPlanItem.id,
          },
        },
      });
      expect(job).toBeFalsy();
      expect(addNotificationSpy).not.toHaveBeenCalled();
    });

    it("should not add a notification if there meal plan config is not configured to allow meat notifications", async () => {
      const recipe = await generateRecipe();
      await generateRecipeIngredient({
        recipe_id: recipe.id,
        name: "Chicken",
        amount: "2.4",
        unit: "cups",
      });

      const mealPlan = await generateMealPlan({
        configuration: (<MealPlanConfigurationSchema>{
          meats: {
            send_thawing_notification: false,
            preferred_thawing_method: "cold_water",
          },
        }) as any,
        user_id: recipe.user_id,
      });

      const meatyMealPlanItem = await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        recipe_id: recipe.id,
        start_date: DateTime.utc().plus({ days: 10 }).toJSDate(),
      });

      const itemJob = await prisma.sideJob.create({
        data: {
          type: JobType.MEAL_PLAN_ITEM,
          user_id: mealPlan.user_id,
          job_data: <MealPlanItemJobDataSchema>{
            meal_plan_item_id: meatyMealPlanItem.id,
            meal_plan_id: mealPlan.id,
          },
        },
      });

      await processMealPlanItem({
        name: itemJob.id,
        id: itemJob.id,
      } as Job);

      const job = await prisma.sideJob.findFirst({
        where: {
          type: JobType.MEAL_PLAN_NOTIFICATION,
          job_data: {
            path: ["meal_plan_item_id"],
            equals: meatyMealPlanItem.id,
          },
        },
      });
      expect(job).toBeFalsy();
      expect(addNotificationSpy).not.toHaveBeenCalled();
    });
  });
});
