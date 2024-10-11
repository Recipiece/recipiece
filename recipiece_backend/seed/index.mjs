import { seedRecipes } from "./recipe.seed.mjs";
import { seedUsers } from "./user.seed.mjs";

const main = async () => {
  console.log("seeding users");
  await seedUsers();
  console.log("seeding recipes");
  await seedRecipes();
};

main().then(() => {
  console.log("seeding finished!");
});
