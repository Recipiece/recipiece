import { faker } from "@faker-js/faker";
import { prisma, User, UserCredentials, UserKitchenMembership } from "@recipiece/database";

export const generateUserKitchenMembership = async (membership?: Partial<Omit<UserKitchenMembership, "id">>) => {
  const sourceUserId = membership?.source_user_id ?? (await generateUser()).id;
  const destUserId = membership?.destination_user_id ?? (await generateUser()).id;
  const status = membership?.status ?? faker.helpers.arrayElement(["accepted", "pending", "denied"]);

  return prisma.userKitchenMembership.create({
    data: {
      source_user_id: sourceUserId,
      destination_user_id: destUserId,
      status: status,
      created_at: membership?.created_at,
    },
  });
};

export const generateUserCredentials = async (userCredentials?: Partial<Omit<UserCredentials, "id">>) => {
  const userId = userCredentials?.user_id ?? (await generateUser()).id;

  return prisma.userCredentials.create({
    data: {
      user_id: userId,
      password_hash: userCredentials?.password_hash ?? faker.internet.password(),
      created_at: userCredentials?.created_at,
    },
  });
};

export const generateUser = async (user?: Partial<Omit<User, "id">>): Promise<User> => {
  return prisma.user.create({
    data: {
      username: user?.username ?? faker.internet.username(),
      email: user?.email ?? faker.internet.email(),
      created_at: user?.created_at,
      validated: user?.validated ?? false,
      preferences: user?.preferences ?? {
        account_visibility: "protected",
      },
    },
  });
};
