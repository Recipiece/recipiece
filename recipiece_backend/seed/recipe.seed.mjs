import { prisma } from "./prisma.mjs";
import Jabber from "jabber";

export const seedRecipes = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: "dev@recipiece.org",
    },
  });

  await seedRecipesForUser(user);

  const otherUser = await prisma.user.findUnique({
    where: {
      email: "other@recipiece.org",
    },
  });

  await seedRecipesForUser(otherUser);
};

const seedRecipesForUser = async (user) => {
  const jabber = new Jabber.default();
  const ingJabber = new Jabber.default(["cup", "gram", "milligram", "milliliter", "pound", "ounce", "kilogram"], 1);

  for (let i = 0; i < 45; i++) {
    const recipe = await prisma.recipe.create({
      data: {
        user_id: user.id,
        private: i % 2 == 0,
        name: jabber.createWord(Math.floor(Math.random() * 20)) + " " + jabber.createWord(Math.floor(Math.random() * 20)),
        description: jabber.createParagraph(40),
      },
    });

    for (let j = 0; j < i; j++) {
      await prisma.recipeIngredient.create({
        data: {
          name: jabber.createWord(12),
          unit: j % 2 === 0 ? ingJabber.createWord(1) : undefined,
          amount: j % 3 === 0 ? Math.round(Math.random() * 100).toString() : undefined,
          recipe_id: recipe.id,
          order: j,
        },
      });
    }

    for (let j = 0; j < i; j++) {
      await prisma.recipeStep.create({
        data: {
          content: jabber.createParagraph(40),
          recipe_id: recipe.id,
          order: j,
        },
      });
    }
  }
};
