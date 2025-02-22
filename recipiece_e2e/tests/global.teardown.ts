import { test as teardown } from "@playwright/test";
import { prisma } from "@recipiece/database";
import { Seed } from "../util";

teardown("deseed", async ({}) => {
  await prisma.user.deleteMany({
    where: {
      email: Seed.PLAYWRIGHT_USER_EMAIL,
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: Seed.SHARE_USER_EMAIL,
    },
  });
});
