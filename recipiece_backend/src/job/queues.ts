import { Queue } from "bullmq";

export const mealPlanConfigurationQueue = new Queue("MealPlanConfigurations", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
    enableOfflineQueue: false,
  },
});

export const mealPlanNotificationsQueue = new Queue("MealPlanNotifications", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
    enableOfflineQueue: false,
  },
});

export const recipeImportQueue = new Queue("RecipeImports", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
    enableOfflineQueue: false,
  },
});
