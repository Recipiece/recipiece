import { Worker } from "bullmq";
import { processMealPlanConfigurationUpdate } from "./processors/mealPlanConfigurations";
import { processMealPlanNotification } from "./processors/mealPlanNotifications";
import { importRecipes } from "./processors/recipeImports";

for (let i = 0; i < 5; i++) {
  new Worker("MealPlanConfigurations", processMealPlanConfigurationUpdate, {
    connection: {
      url: process.env.REDIS_QUEUE_URL!,
    },
  });
}

for (let i = 0; i < 5; i++) {
  new Worker("MealPlanNotifications", processMealPlanNotification, {
    connection: {
      url: process.env.REDIS_QUEUE_URL!,
    },
  });
}

for (let i = 0; i < 5; i++) {
  new Worker("RecipeImports", importRecipes, {
    connection: {
      url: process.env.REDIS_QUEUE_URL!,
    },
  });
}
