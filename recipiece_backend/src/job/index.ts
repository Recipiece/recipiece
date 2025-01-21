import { Queue, Worker } from "bullmq";
import { processTimer } from "./timers";
import { importRecipes } from "./recipeImports";

export const recipeImportQueue = new Queue("RecipeImports", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
  },
});

export const timersQueue = new Queue("Timers", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
  },
});

for (let i = 0; i < 5; i++) {
  new Worker("Timers", processTimer, {
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
