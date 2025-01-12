import { prisma } from "./prisma.mjs";
import { faker } from "@faker-js/faker";

const UNITS = ["cup", "gram", "milligram", "milliliter", "pound", "ounce", "kilogram"];

export const seedRecipes = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: "dev@recipiece.org",
    },
  });

  await seedRecipesForUser(user, 150);

  const otherUser = await prisma.user.findUnique({
    where: {
      email: "other@recipiece.org",
    },
  });

  await seedRecipesForUser(otherUser);
};

const seedRecipesForUser = async (user, count = 45) => {
  const getRandomUnit = () => {
    return UNITS[Math.floor(Math.random() * UNITS.length)];
  };

  const dishNames = faker.helpers.uniqueArray(faker.food.dish, count);

  for (let i = 0; i < count; i++) {
    const recipe = await prisma.recipe.create({
      data: {
        user_id: user.id,
        name: dishNames[i],
        description: faker.food.description(),
      },
    });

    for (let j = 0; j < i + 1; j++) {
      await prisma.recipeIngredient.create({
        data: {
          name: faker.food.ingredient(),
          unit: j % 2 === 0 ? getRandomUnit() : undefined,
          amount: j % 3 === 0 ? Math.round(Math.random() * 100).toString() : undefined,
          recipe_id: recipe.id,
          order: j,
        },
      });
    }

    for (let j = 0; j < i + 1; j++) {
      await prisma.recipeStep.create({
        data: {
          content: faker.word.words({ count: { min: 20, max: 100 } }),
          recipe_id: recipe.id,
          order: j,
        },
      });
    }
  }
};
