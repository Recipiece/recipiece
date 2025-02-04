import { Queue } from "bullmq";

export const mealPlanConfigurationQueue = new Queue("MealPlanConfigurations", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});

export const mealPlanNotificationsQueue = new Queue("MealPlanNotifications", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});

export const recipeImportQueue = new Queue("RecipeImports", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});

export const mealPlanItemQueue = new Queue("MealPlanItems", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});
