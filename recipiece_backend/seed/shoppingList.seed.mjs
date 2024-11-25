import { prisma } from "./prisma.mjs";
import { faker } from "@faker-js/faker";

export const seedShoppingLists = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: "dev@recipiece.org",
    },
  });
  await seedShoppingListsForUser(user);

  const otherUser = await prisma.user.findUnique({
    where: {
      email: "other@recipiece.org",
    },
  });

  await seedShoppingListsForUser(otherUser);
};

const seedShoppingListsForUser = async (user) => {
  for (let i = 0; i < 10; i++) {
    const numItems = Math.floor(Math.random() * 50);
    const ingredients = faker.helpers.uniqueArray(faker.food.ingredient, numItems);
    const itemsArrayBase = [...new Array(numItems)].map((_, idx) => {
      return {
        content: ingredients[idx],
        completed: idx < numItems / 2,
        order: idx < numItems / 2 ? idx + 1 : (idx % (numItems / 2)) + 1,
      };
    });

    await prisma.shoppingList.create({
      data: {
        user_id: user.id,
        name: faker.word.words({count: {min: 1, max: 5}}),
        shopping_list_items: {
          createMany: {
            data: [...itemsArrayBase],
          },
        },
      },
    });
  }
};
