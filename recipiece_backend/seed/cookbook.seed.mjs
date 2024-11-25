import { prisma } from "./prisma.mjs";
import { faker } from "@faker-js/faker";

export const seedCookbooks = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: "dev@recipiece.org",
    },
  });
  await seedCookbooksForUser(user);

  const otherUser = await prisma.user.findUnique({
    where: {
      email: "other@recipiece.org",
    },
  });

  await seedCookbooksForUser(otherUser);
};

const seedCookbooksForUser = async (user) => {
  const recipesForUser = await prisma.recipe.findMany({
    where: {
      user_id: user.id,
    },
  });

  const titles = faker.helpers.uniqueArray(faker.book.title, 12);

  for (let i = 0; i < 12; i++) {
    const cookbook = await prisma.cookbook.create({
      data: {
        name: titles[i],
        user_id: user.id,
        description: faker.lorem.paragraph(),
        private: i % 2 === 0,
      },
    });

    const shuffled = recipesForUser.sort(() => 0.5 - Math.random());
    const numToAttach = Math.max(1, Math.floor(Math.random() * shuffled.length));
    const recipesToAttach = shuffled.splice(0, numToAttach);

    await prisma.recipeCookbookAttachment.createMany({
      data: recipesToAttach.map((recipe) => {
        return {
          recipe_id: recipe.id,
          cookbook_id: cookbook.id,
        };
      }),
    });
  }
};
