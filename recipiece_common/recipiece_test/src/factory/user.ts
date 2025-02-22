import { faker } from "@faker-js/faker";
import { prisma, PrismaTransaction, User, UserCredentials, UserKitchenMembership, UserTag } from "@recipiece/database";
import argon2 from "argon2";

export const generateUserTag = async (tag?: Partial<Omit<UserTag, "id">>, tx?: PrismaTransaction) => {
  const userId = tag?.user_id ?? (await generateUser(undefined, tx)).id;

  return (tx ?? prisma).userTag.create({
    data: {
      user_id: userId,
      content: (tag?.content ?? faker.word.words({ count: 1 })).toLowerCase().trim(),
      created_at: tag?.created_at,
    },
  });
};

export const generateUserKitchenMembership = async (membership?: Partial<Omit<UserKitchenMembership, "id">>, tx?: PrismaTransaction) => {
  const sourceUserId = membership?.source_user_id ?? (await generateUser(undefined, tx)).id;
  const destUserId = membership?.destination_user_id ?? (await generateUser(undefined, tx)).id;
  const status = membership?.status ?? faker.helpers.arrayElement(["accepted", "pending", "denied"]);

  return (tx ?? prisma).userKitchenMembership.create({
    data: {
      source_user_id: sourceUserId,
      destination_user_id: destUserId,
      status: status,
      created_at: membership?.created_at ?? new Date(),
    },
  });
};

export const generateUserCredentials = async (userCredentials?: Partial<Omit<UserCredentials, "id">>, tx?: PrismaTransaction) => {
  const userId = userCredentials?.user_id ?? (await generateUser(undefined, tx)).id;

  return (tx ?? prisma).userCredentials.create({
    data: {
      user_id: userId,
      password_hash: userCredentials?.password_hash ?? faker.internet.password(),
      created_at: userCredentials?.created_at ?? new Date(),
    },
  });
};

export const generateHashedPassword = async (plainPassword: string): Promise<string | undefined> => {
  try {
    const hash = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 1,
    });
    return hash;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const generateUser = async (user?: Partial<Omit<User, "id">>, tx?: PrismaTransaction): Promise<User> => {
  return (tx ?? prisma).user.create({
    data: {
      username: user?.username ?? faker.internet.username(),
      email: user?.email ?? faker.internet.email(),
      created_at: user?.created_at ?? new Date(),
      validated: user?.validated ?? false,
      preferences: user?.preferences ?? {
        account_visibility: "protected",
      },
    },
  });
};
