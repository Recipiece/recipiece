import { Queue } from "bullmq";
import { Environment } from "../util/environment";

export const mealPlanConfigurationQueue = new Queue("MealPlanConfigurations", {
  connection: {
    url: Environment.REDIS_QUEUE_URL,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});

export const mealPlanNotificationsQueue = new Queue("MealPlanNotifications", {
  connection: {
    url: Environment.REDIS_QUEUE_URL,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});

export const recipeImportQueue = new Queue("RecipeImports", {
  connection: {
    url: Environment.REDIS_QUEUE_URL,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});

export const mealPlanItemQueue = new Queue("MealPlanItems", {
  connection: {
    url: Environment.REDIS_QUEUE_URL,
    enableOfflineQueue: false,
  },
  defaultJobOptions: {
    delay: 10000,
  },
});
