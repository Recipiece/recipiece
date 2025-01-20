import { Prisma, prisma, Recipe, RecipeIngredient, RecipeStep } from "@recipiece/database";
import { faker } from "@faker-js/faker";
import { generateUser } from "./user";

export const INGREDIENT_UNIT_CHOICES = ["cups", "c", "tablespoons", "tbs", "tbsp", "teaspoons", "tsp", "tsps", "grams", "g", "kilograms", "ounces", "pounds", "lbs"];

export const generateRecipeStep = async (recipeStep?: Partial<Omit<RecipeStep, "id" | "order">>) => {
  const recipeId = recipeStep?.recipe_id ?? (await generateRecipe()).id;

  const currentCount = await prisma.recipeStep.count({
    where: {
      recipe_id: recipeId,
    },
  });

  return prisma.recipeStep.create({
    data: {
      recipe_id: recipeId,
      order: currentCount + 1,
      content:
        recipeStep?.content ??
        faker.word.words({
          count: {
            min: 15,
            max: 50,
          },
        }),
    },
  });
};

export const generateRecipeIngredient = async (recipeIngredient?: Partial<Omit<RecipeIngredient, "id" | "order">>): Promise<RecipeIngredient> => {
  const recipeId = recipeIngredient?.recipe_id ?? (await generateRecipe()).id;

  const currentCount = await prisma.recipeIngredient.count({
    where: {
      recipe_id: recipeId,
    },
  });

  const shouldGenAmount = !!recipeIngredient?.amount || faker.number.int({ min: 0, max: 99 }) % 2 === 0;
  const shouldGenUnit = !!recipeIngredient?.unit || faker.number.int({ min: 0, max: 99 }) % 2 === 0;

  let body: Prisma.RecipeIngredientUncheckedCreateInput = {
    recipe_id: recipeId,
    name: recipeIngredient?.name ?? faker.food.ingredient(),
    order: currentCount + 1,
  };

  if (shouldGenAmount) {
    body.amount = recipeIngredient?.amount ?? faker.number.int({ min: 1, max: 99 }).toString();
  }

  if (shouldGenUnit) {
    body.unit = recipeIngredient?.unit ?? faker.helpers.arrayElement(INGREDIENT_UNIT_CHOICES);
  }

  return await prisma.recipeIngredient.create({
    data: { ...body },
  });
};

export const generateRecipe = async (recipe?: Partial<Omit<Recipe, "id">>): Promise<Recipe> => {
  const userId = recipe?.user_id ?? (await generateUser()).id;

  return await prisma.recipe.create({
    data: {
      user_id: userId,
      name: recipe?.name ?? faker.food.dish(),
      duration_ms: recipe?.duration_ms ?? faker.number.int({ min: 10000, max: 100000 }),
      description: recipe?.description ?? faker.word.words({ count: { min: 5, max: 20 } }),
      servings: recipe?.servings ?? faker.number.int({ min: 1, max: 100 }),
      created_at: recipe?.created_at,
    },
  });
};
