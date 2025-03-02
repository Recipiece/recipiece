/**
 * Before all the tests are even started, we ensure the test database is up to date,
 * and as an extra measure, make sure we're using the test env variables.
 */

import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

import { prisma } from "@recipiece/database";

export default async () => {
  try {
    execSync("dotenvx run -f .env.test -- yarn  --cwd ../recipiece_common/recipiece_database run prisma migrate deploy");
    await prisma.user.deleteMany();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
