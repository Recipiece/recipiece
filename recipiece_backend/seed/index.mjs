import { seedRecipes } from "./recipe.seed.mjs";
import { seedUsers } from "./user.seed.mjs";
import { seedShoppingLists } from "./shoppingList.seed.mjs";
import { prisma } from "./prisma.mjs";
import { seedCookbooks } from "./cookbook.seed.mjs";

const main = async () => {
  console.log("deleting existing user: dev@recipiece.org");
  try {
    await prisma.user.delete({
      where: {
        email: "dev@recipiece.org",
      },
    });
  } catch {
    console.log("no user to delete");
  }

  console.log("deleting existing user: other@recipiece.org");
  try {
    await prisma.user.delete({
      where: {
        email: "other@recipiece.org",
      },
    });
  } catch {
    console.log("no user to delete");
  }

  console.log("seeding users");
  await seedUsers();
  console.log("seeding recipes");
  await seedRecipes();
  console.log("seeding cookbooks");
  await seedCookbooks();
  console.log("seeding shopping lists");
  await seedShoppingLists();
};

main().then(() => {
  console.log("seeding finished!");
});
