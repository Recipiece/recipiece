/**
 * In this file, we
 * 1. setup the global transactional prisma object
 * 2. Spin up and shut down the supertest server
 * 3. Initialize any globally available fixtures
 *
 * This allows each test to run in a transaction, and also injects the transactional prisma down into
 * the actual api calls that are being made.
 */

import "@quramy/jest-prisma-node";
import { User } from "@prisma/client";
import { randomUUID } from "crypto";
import app from "./src/app";
import { hashPassword } from "./src/util/password";
import { generateToken } from "./src/util/token";

declare global {
  var prisma: typeof jestPrisma.client;
  var server: ReturnType<typeof app.listen>;
  var fixtures: {
    createUserAndToken: (email?: string) => Promise<[User, string]>;
  };
}

// setup fixtures
globalThis.fixtures = {
  createUserAndToken: async (absoluteEmail?: string): Promise<[User, string]> => {
    function stringGen(len: number) {
      var text = "";
      var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < len; i++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      return text;
    }

    const email = absoluteEmail ?? `${stringGen(15)}@${stringGen(5)}.${stringGen(3)}`;
    const password = "test1234!";
    const hashedPassword = await hashPassword(password);

    const user = await jestPrisma.client.user.create({
      data: {
        email: email,
      },
    });
    await jestPrisma.client.userCredentials.create({
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
  },
};

// setup the jest prisma client and mock
globalThis.prisma = jestPrisma.client;

jest.mock("./src/database/prisma", () => {
  return {
    prisma: jestPrisma.client,
  };
});

// just in case there's any extra users hanging around.
beforeEach(async () => {
  await jestPrisma.client.user.deleteMany();
});

// setup the server object before each test, and tear it down after each test
beforeAll((done) => {
  globalThis.server = app.listen(0, "localhost", done);
});

afterAll((done) => {
  server?.close(done);
});
