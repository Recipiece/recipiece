import { Job, Worker } from "bullmq";
import { importRecipes, processMealPlanConfigurationUpdate, processMealPlanItem, processMealPlanNotification } from "./processors";
import { prisma } from "@recipiece/database";

const attachLogging = (worker: Worker) => {
  worker.on("failed", (job?: Job, err?: Error) => {
    console.log(`Job with id ${job?.id} failed to process`);
    err && console.error(err);
  });

  worker.on("error", (err: Error) => {
    console.error(err);
  });

  worker.on("active", (job?: Job) => {
    console.log(`Job with id ${job?.id} has moved into active state`);
  });

  worker.on("completed", (job?: Job) => {
    console.log(`Job with id ${job?.id} has completed.`);
  });
};

const jobWrapper = (fn: (job: Job) => any) => {
  return async (job: Job) => {
    try {
      await fn(job);
    } catch (err) {
      console.error(err);
    } finally {
      // prisma throws an error on delete, and the job might not actually exist anyways at this point
      // so user deleteMany here to avoid that.
      await prisma.sideJob.deleteMany({
        where: {
          id: job.id!,
        },
      });
    }
  };
};

const configsWorker = new Worker("MealPlanConfigurations", jobWrapper(processMealPlanConfigurationUpdate), {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
  },
  concurrency: 20,
});
attachLogging(configsWorker);

const mealPlanNotificationsWorker = new Worker("MealPlanNotifications", jobWrapper(processMealPlanNotification), {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
  },
  concurrency: 20,
});
attachLogging(mealPlanNotificationsWorker);

const recipeImportWorker = new Worker("RecipeImports", jobWrapper(importRecipes), {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
  },
  concurrency: 10,
});
attachLogging(recipeImportWorker);

const mealPlanItemsWorker = new Worker("MealPlanItems", jobWrapper(processMealPlanItem), {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
  },
  concurrency: 20,
});
attachLogging(mealPlanItemsWorker);
