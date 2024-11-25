import { prisma } from "./prisma.mjs";
import Jabber from "jabber";

export const seedShoppingLists = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: "dev@recipiece.org",
    },
  });
  await seedShoppingListsForUser(user);
};

const seedShoppingListsForUser = async (user) => {
  const jabber = new Jabber.default();

  for (let i = 0; i < 10; i++) {
    const numItems = Math.floor(Math.random() * 50);
    const itemsArrayBase = [...new Array(numItems)].map((_, idx) => {
      return {
        content:
          jabber.createWord(Math.floor(Math.random() * 20)) + " " + jabber.createWord(Math.floor(Math.random() * 20)),
        completed: idx < numItems / 2,
        order: idx < numItems / 2 ? idx : idx % (numItems / 2),
      };
    });

    await prisma.shoppingList.create({
      data: {
        user_id: user.id,
        name:
          jabber.createWord(Math.floor(Math.random() * 20)) + " " + jabber.createWord(Math.floor(Math.random() * 20)),
        shopping_list_items: {
          createMany: {
            data: [...itemsArrayBase],
          },
        },
      },
    });
  }
};
