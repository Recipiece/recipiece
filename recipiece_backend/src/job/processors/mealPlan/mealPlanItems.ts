import { KyselySql, prisma } from "@recipiece/database";
import { YMealPlanConfigurationSchema, YMealPlanItemJobDataSchema } from "@recipiece/types";
import { Job } from "bullmq";
import { MEAT_LIKE_INGREDIENTS, processMeatThawing } from "./util";

export const processMealPlanItem = async (job: Job) => {
  return await prisma.$transaction(async (tx) => {
    const sideJobId = job.id;

    const sideJob = await tx.sideJob.findFirst({
      where: { id: sideJobId },
    });

    if (!sideJob) {
      console.log(`side job ${sideJobId} not found`);
      return undefined;
    }

    const jobData = YMealPlanItemJobDataSchema.cast(sideJob.job_data);

    const mealPlanItem = await tx.mealPlanItem.findFirst({
      where: {
        id: jobData.meal_plan_item_id,
      },
      include: {
        meal_plan: true,
      },
    });

    if (!mealPlanItem) {
      console.log(`Meal Plan Item ${mealPlanItem} does not exist!`);
      return undefined;
    }

    const config = YMealPlanConfigurationSchema.cast(mealPlanItem.meal_plan.configuration);
    if (mealPlanItem.recipe_id) {
      if (config.meats?.send_thawing_notification && !!config.meats.preferred_thawing_method) {
        const meatyIngredientsQuery = tx.$kysely
          .selectFrom("recipe_ingredients")
          .selectAll("recipe_ingredients")
          .leftJoin("recipes", "recipes.id", "recipe_ingredients.recipe_id")
          .leftJoin("meal_plan_items", "meal_plan_items.recipe_id", "recipes.id")
          .where("meal_plan_items.id", "=", mealPlanItem.id)
          .where(() => {
            const joined = KyselySql.raw(MEAT_LIKE_INGREDIENTS.join("|"));
            return KyselySql`lower(recipe_ingredients.name) similar to '%(${joined})%'`;
          });
        const meatyIngredients = await meatyIngredientsQuery.execute();

        if (meatyIngredients.length > 0) {
          console.log(`meal plan item ${mealPlanItem.id} has at least one meat like ingredient, processing thawing`)
          const knownIngredients = await tx.knownIngredient.findMany();
          return await processMeatThawing(tx, sideJob.user_id, mealPlanItem, config, meatyIngredients, knownIngredients);
        } else {
          console.log(`meal plan item ${mealPlanItem.id} has no meat-like ingredients`);
        }
      } else {
        console.log(`configuration has send_thawing_notification=${config.meats?.send_thawing_notification} and preferred_thawing_method=${config.meats?.preferred_thawing_method}, no processing can be done.`)
      }
    } else {
      console.log(`meal plan item ${mealPlanItem.id} has no recipe associated with it`);
    }
    return undefined;
  });
};
