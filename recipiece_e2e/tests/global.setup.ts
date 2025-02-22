import { test as setup } from "@playwright/test";
import { generateHashedPassword, generateUser, generateUserCredentials } from "@recipiece/test";
import { Seed } from "../util";
import { prisma } from "@recipiece/database";

setup("seed", async () => {
  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({
      where: {
        email: Seed.PLAYWRIGHT_USER_EMAIL,
      },
    });
    await tx.user.deleteMany({
      where: {
        email: Seed.SHARE_USER_EMAIL,
      },
    });

    const playwrightUser = await generateUser(
      {
        email: Seed.PLAYWRIGHT_USER_EMAIL,
        username: Seed.PLAYWRIGHT_USER_USERNAME,
      },
      tx
    );

    await generateUserCredentials(
      {
        user_id: playwrightUser.id,
        password_hash: await generateHashedPassword(Seed.PLAYWRIGHT_USER_PASSWORD),
      },
      tx
    );

    const shareUser = await generateUser(
      {
        email: Seed.SHARE_USER_EMAIL,
        username: Seed.SHARE_USER_USERNAME,
      },
      tx
    );

    await generateUserCredentials(
      {
        user_id: shareUser.id,
        password_hash: await generateHashedPassword(Seed.SHARE_USER_PASSWORD),
      },
      tx
    );
  });
});
