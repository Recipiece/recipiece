import { Prisma, prisma, Recipe, RecipeIngredient, RecipeShare, RecipeStep, UserKitchenMembership } from "@recipiece/database";
import { base, faker } from "@faker-js/faker";
import { generateUser, generateUserKitchenMembership } from "./user";

export const INGREDIENT_UNIT_CHOICES = ["cups", "c", "tablespoons", "tbs", "tbsp", "teaspoons", "tsp", "tsps", "grams", "g", "kilograms", "ounces", "pounds", "lbs"];

type FullRecipeInput = Partial<Omit<Recipe, "id">> & {
  readonly ingredients?: Partial<Omit<RecipeIngredient, "id" | "order" | "recipe_id">>[];
  readonly steps?: Partial<Omit<RecipeStep, "id" | "order" | "recipe_id">>[];
};

type FullRecipeOutput = Recipe & {
  readonly ingredients: RecipeIngredient[];
  readonly steps: RecipeStep[];
};

export const generateRecipeWithIngredientsAndSteps = async (recipe?: FullRecipeInput): Promise<FullRecipeOutput> => {
  const { ingredients, steps, ...restRecipe } = recipe ?? {};

  const baseRecipe = await generateRecipe(restRecipe);

  let dbIngredients: RecipeIngredient[] = [];
  if (ingredients !== null && ingredients !== undefined) {
    dbIngredients = await Promise.all(
      ingredients.map(async (ing) => {
        return await generateRecipeIngredient({
          ...ing,
          recipe_id: baseRecipe.id,
        });
      })
    );
  } else {
    const numIngs = faker.number.int({ min: 1, max: 20 });
    for (let i = 0; i < numIngs; i++) {
      dbIngredients.push(await generateRecipeIngredient({ recipe_id: baseRecipe.id }));
    }
  }

  let dbSteps: RecipeStep[] = [];
  if (steps !== null && steps !== undefined) {
    dbSteps = await Promise.all(
      steps.map(async (step) => {
        return await generateRecipeStep({
          ...step,
          recipe_id: baseRecipe.id,
        });
      })
    );
  } else {
    const numSteps = faker.number.int({ min: 1, max: 10 });
    for (let i = 0; i < numSteps; i++) {
      dbSteps.push(await generateRecipeStep({ recipe_id: baseRecipe.id }));
    }
  }

  return {
    ...baseRecipe,
    steps: [...dbSteps],
    ingredients: [...dbIngredients],
  };
};

export const generateRecipeShare = async (recipeShare?: Partial<Omit<RecipeShare, "id">>) => {
  let recipe: Recipe | undefined = undefined;
  if (recipeShare?.recipe_id) {
    recipe =
      (await prisma.recipe.findFirst({
        where: {
          id: recipeShare.recipe_id,
        },
      })) ?? undefined;
  }

  if (!recipe) {
    recipe = await generateRecipe();
  }

  let membership: UserKitchenMembership | undefined = undefined;
  if (recipeShare?.user_kitchen_membership_id) {
    membership =
      (await prisma.userKitchenMembership.findFirst({
        where: {
          id: recipeShare.user_kitchen_membership_id,
        },
      })) ?? undefined;
  }

  if (!membership) {
    membership = await generateUserKitchenMembership({
      source_user_id: recipe.user_id,
      status: "accepted",
    });
  }

  return prisma.recipeShare.create({
    data: {
      recipe_id: recipe.id,
      user_kitchen_membership_id: membership.id,
      created_at: recipeShare?.created_at ?? new Date(),
    },
  });
};

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
      created_at: recipe?.created_at ?? new Date(),
    },
  });
};
