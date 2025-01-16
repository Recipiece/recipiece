/**
 * Before all the tests are even started, we ensure the test database is up to date,
 * and as an extra measure, make sure we're using the test env variables.
 */

import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default async () => {
  try {
    // execSync("yarn run dotenv -e .env.test prisma migrate deploy");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
