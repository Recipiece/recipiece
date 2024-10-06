import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

import { prisma } from "./src/database";

beforeAll(async () => {
  try {
    execSync("yarn run dotenv -e .env.test prisma migrate deploy");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.recipe.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
