import { faker } from "@faker-js/faker";
import { prisma, PrismaTransaction, User, UserCredentials, UserKitchenMembership, UserTag, UserValidationToken } from "@recipiece/database";
import argon2 from "argon2";
import { emailGenerator, tagGenerator, usernameGenerator } from "../generator";
import { Data } from "@recipiece/constant";

export const generateUserTag = async (tag?: Partial<Omit<UserTag, "id">>, tx?: PrismaTransaction) => {
  const userId = tag?.user_id ?? (await generateUser(undefined, tx)).id;

  return (tx ?? prisma).userTag.create({
    data: {
      user_id: userId,
      content: (tag?.content ?? tagGenerator.next().value).toLowerCase().trim(),
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
      username: user?.username ?? usernameGenerator.next().value,
      email: user?.email ?? emailGenerator.next().value,
      created_at: user?.created_at ?? new Date(),
      validated: user?.validated ?? false,
      preferences: user?.preferences ?? {
        account_visibility: "protected",
      },
    },
  });
};

export const generateUserWithPassword = async (rawPassword: string, user?: Partial<Omit<User, "id">>, tx?: PrismaTransaction): Promise<[User, UserCredentials]> => {
  const generatedUser = await generateUser(user, tx);
  const credentials = await generateUserCredentials(
    {
      user_id: generatedUser.id,
      password_hash: await generateHashedPassword(rawPassword),
    },
    tx
  );
  return [generatedUser, credentials];
};

export const generateUserValidationToken = async (token?: Partial<Omit<UserValidationToken, "id">>, tx?: PrismaTransaction): Promise<UserValidationToken> => {
  const userId = token?.user_id ?? (await generateUser(undefined, tx)).id;
  const purpose = token?.purpose ?? faker.helpers.arrayElement([Data.UserValidationTokenTypes.FORGOT_PASSWORD.purpose, Data.UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose]);

  return await (tx ?? prisma).userValidationToken.create({
    data: {
      user_id: userId,
      purpose: purpose,
      created_at: token?.created_at,
    },
  });
};
