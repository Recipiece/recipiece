import { faker } from "@faker-js/faker";
import { prisma, User, UserCredentials } from "@recipiece/database";

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
    },
  });
};
