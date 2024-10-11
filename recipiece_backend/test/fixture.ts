import { randomUUID } from "crypto";
import { prisma } from "../src/database";
import { hashPassword } from "../src/util/password";
import { generateToken } from "../src/util/token";
import { User } from "@prisma/client";

export const createUserAndToken = async (email = "user@recipiece.org"): Promise<[User, string]> => {
  const password = "test1234!";
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email,
    },
  });
  await prisma.userCredentials.create({
    data: {
      user_id: user.id,
      password_hash: hashedPassword!,
    },
  });

  const payload = {
    id: randomUUID(),
    user: user.email,
  };

  const bearerToken = generateToken(payload, "24h");

  return [user, bearerToken];
};

it("should make jest happy", () => {
  expect(true).toBeTruthy();
});
