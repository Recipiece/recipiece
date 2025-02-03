import { generateMealPlan, generateMealPlanItem } from "@recipiece/test";
import { DateTime } from "luxon";
import { mealPlanItemQueue } from "../../../../src/job";
import { prisma } from "@recipiece/database";
import { JobType } from "../../../../src/util/constant";
import { MealPlanConfigurationJobDataSchema } from "@recipiece/types";
import { processMealPlanConfigurationUpdate } from "../../../../src/job/processors";
import { Job } from "bullmq";

describe("Meal Plan Configuration Jobs", () => {
  let mealPlanItemSpy: jest.SpyInstance;

  beforeEach(() => {
    mealPlanItemSpy = jest.spyOn(mealPlanItemQueue, "add");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should process future meal plan items", async () => {
    const mealPlan = await generateMealPlan();
    const pastItem = await generateMealPlanItem({
      meal_plan_id: mealPlan.id,
      start_date: DateTime.utc().minus({ days: 3 }).toJSDate(),
    });
    const futureItem = await generateMealPlanItem({
      meal_plan_id: mealPlan.id,
      start_date: DateTime.utc().plus({ days: 2 }).toJSDate(),
    });

    const job = await prisma.sideJob.create({
      data: {
        type: JobType.MEAL_PLAN_CONFIGURATION,
        user_id: mealPlan.user_id,
        job_data: <MealPlanConfigurationJobDataSchema>{
          meal_plan_id: mealPlan.id,
        },
      },
    });

    await processMealPlanConfigurationUpdate({ id: job.id } as Job);

    const futureMealPlanItemJob = await prisma.sideJob.findFirst({
      where: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          path: ["meal_plan_item_id"],
          equals: futureItem.id,
        },
      },
    });
    expect(futureMealPlanItemJob).toBeTruthy();

    const pastMealPlanItemJob = await prisma.sideJob.findFirst({
      where: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          path: ["meal_plan_item_id"],
          equals: pastItem.id,
        },
      },
    });
    expect(pastMealPlanItemJob).toBeFalsy();

    expect(mealPlanItemSpy).toHaveBeenCalledTimes(1);
  });
});
