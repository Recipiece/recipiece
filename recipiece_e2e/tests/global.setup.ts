import { test as setup } from "@playwright/test";
import { prisma } from "@recipiece/database";

setup("seed", async () => {
  await prisma.user.deleteMany();
});
