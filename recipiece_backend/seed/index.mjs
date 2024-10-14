import { seedRecipes } from "./recipe.seed.mjs";
import { seedUsers } from "./user.seed.mjs";
import { prisma } from "./prisma.mjs";

const main = async () => {
  console.log("deleting existing user");
  await prisma.user.delete({
    where: {
      email: "dev@recipiece.org",
    },
  });

  console.log("seeding users");
  await seedUsers();
  console.log("seeding recipes");
  await seedRecipes();
};

main().then(() => {
  console.log("seeding finished!");
});
