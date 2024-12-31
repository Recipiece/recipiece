import { prisma } from "./prisma.mjs";
import argon2 from "argon2";

const hashPassword = async (plainPassword) => {
  try {
    const hash = await argon2.hash(plainPassword, {
      type: argon2.argon2id, // Argon2id variant is the most secure
      memoryCost: 2 ** 16, // Memory cost parameter (e.g., 64 MB)
      timeCost: 5, // Time cost (e.g., 5 iterations)
      parallelism: 1, // Parallelism factor (e.g., single-threaded)
    });
    return hash;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const seedUsers = async () => {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: "dev@recipiece.org",
        username: "dev29",
        validated: true,
      },
    });
    await tx.userCredentials.create({
      data: {
        user_id: user.id,
        password_hash: await hashPassword("password"),
      },
    });

    const otherUser = await tx.user.create({
      data: {
        email: "other@recipiece.org",
        username: "other92",
        validated: true,
      },
    });
    await tx.userCredentials.create({
      data: {
        user_id: otherUser.id,
        password_hash: await hashPassword("password"),
      },
    });
  });
};
