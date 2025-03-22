import { faker } from "@faker-js/faker";
import { Prisma, prisma, PrismaTransaction, Recipe, RecipeIngredient, RecipeStep, RecipeTagAttachment, User, UserTag } from "@recipiece/database";
import { generateUser, generateUserTag } from "./user";

export const INGREDIENT_UNIT_CHOICES = ["cups", "c", "tablespoons", "tbs", "tbsp", "teaspoons", "tsp", "tsps", "grams", "g", "kilograms", "ounces", "pounds", "lbs"];

type FullRecipeInput = Partial<Omit<Recipe, "id">> & {
  readonly ingredients?: Partial<Omit<RecipeIngredient, "id" | "order" | "recipe_id">>[];
  readonly steps?: Partial<Omit<RecipeStep, "id" | "order" | "recipe_id">>[];
};

type FullRecipeOutput = Recipe & {
  readonly ingredients: RecipeIngredient[];
  readonly steps: RecipeStep[];
};

export const generateRecipeWithIngredientsAndSteps = async (recipe?: FullRecipeInput, tx?: PrismaTransaction): Promise<FullRecipeOutput> => {
  const { ingredients, steps, ...restRecipe } = recipe ?? {};

  const baseRecipe = await generateRecipe(restRecipe, tx);

  let dbIngredients: RecipeIngredient[] = [];
  if (ingredients !== null && ingredients !== undefined) {
    dbIngredients = await Promise.all(
      ingredients.map(async (ing) => {
        return await generateRecipeIngredient(
          {
            ...ing,
            recipe_id: baseRecipe.id,
          },
          tx
        );
      })
    );
  } else {
    const numIngs = faker.number.int({ min: 1, max: 20 });
    for (let i = 0; i < numIngs; i++) {
      dbIngredients.push(await generateRecipeIngredient({ recipe_id: baseRecipe.id }, tx));
    }
  }

  let dbSteps: RecipeStep[] = [];
  if (steps !== null && steps !== undefined) {
    dbSteps = await Promise.all(
      steps.map(async (step) => {
        return await generateRecipeStep(
          {
            ...step,
            recipe_id: baseRecipe.id,
          },
          tx
        );
      })
    );
  } else {
    const numSteps = faker.number.int({ min: 1, max: 10 });
    for (let i = 0; i < numSteps; i++) {
      dbSteps.push(await generateRecipeStep({ recipe_id: baseRecipe.id }, tx));
    }
  }

  return {
    ...baseRecipe,
    steps: [...dbSteps],
    ingredients: [...dbIngredients],
  };
};

export const generateRecipeStep = async (recipeStep?: Partial<Omit<RecipeStep, "id" | "order">>, tx?: PrismaTransaction) => {
  const recipeId = recipeStep?.recipe_id ?? (await generateRecipe(undefined, tx)).id;

  const currentCount = await (tx ?? prisma).recipeStep.count({
    where: {
      recipe_id: recipeId,
    },
  });

  return (tx ?? prisma).recipeStep.create({
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

export const generateRecipeIngredient = async (recipeIngredient?: Partial<Omit<RecipeIngredient, "id" | "order">>, tx?: PrismaTransaction): Promise<RecipeIngredient> => {
  const recipeId = recipeIngredient?.recipe_id ?? (await generateRecipe(undefined, tx)).id;

  const currentCount = await (tx ?? prisma).recipeIngredient.count({
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

  return await (tx ?? prisma).recipeIngredient.create({
    data: { ...body },
  });
};

export const generateRecipe = async (recipe?: Partial<Omit<Recipe, "id">>, tx?: PrismaTransaction): Promise<Recipe> => {
  const userId = recipe?.user_id ?? (await generateUser(undefined, tx)).id;

  return await (tx ?? prisma).recipe.create({
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

export const generateRecipeTagAttachment = async (attachment?: Partial<RecipeTagAttachment>, tx?: PrismaTransaction): Promise<RecipeTagAttachment> => {
  let user: User | null = null;
  let recipe: Recipe | null = null;
  let userTag: UserTag | null = null;

  if (attachment?.recipe_id) {
    recipe = await (tx ?? prisma).recipe.findFirst({
      where: {
        id: attachment.recipe_id,
      },
    });
  }

  if (attachment?.user_tag_id) {
    userTag = await (tx ?? prisma).userTag.findFirst({
      where: {
        id: attachment.user_tag_id,
      },
    });
  }

  if (recipe && userTag) {
    if (recipe.user_id !== userTag.user_id) {
      throw new Error(`recipe belonging to ${recipe.user_id} cannot be tagged by user ${userTag.id}`);
    }
    user = await (tx ?? prisma).user.findFirst({
      where: {
        id: recipe.user_id,
      },
    });
  } else if (!recipe && userTag) {
    user = await (tx ?? prisma).user.findFirst({
      where: {
        id: userTag.user_id,
      },
    });
  } else if (!userTag && recipe) {
    user = await (tx ?? prisma).user.findFirst({
      where: {
        id: recipe.user_id,
      },
    });
  }

  if (!user) {
    user = await generateUser(undefined, tx);
  }

  if (!recipe) {
    recipe = await generateRecipe({ user_id: user!.id }, tx);
  }

  if (!userTag) {
    userTag = await generateUserTag({ user_id: user.id }, tx);
  }

  return (tx ?? prisma).recipeTagAttachment.create({
    data: {
      recipe_id: recipe.id,
      user_tag_id: userTag.id,
    },
  });
};
