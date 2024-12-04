/**
 * In this file, we
 * 1. setup the global transactional prisma object
 * 2. Spin up and shut down the supertest server
 * 3. Initialize any globally available fixtures
 *
 * This allows each test to run in a transaction, and also injects the transactional prisma down into
 * the actual api calls that are being made.
 */

import { User } from "@prisma/client";
import "@quramy/jest-prisma-node";
import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import app from "./src/app";
import { UserSessions } from "./src/util/constant";
import { hashPassword } from "./src/util/password";
import { generateToken } from "./src/util/token";
import { enableFetchMocks } from "jest-fetch-mock";

declare global {
  var testPrisma: typeof jestPrisma.client;
  var server: ReturnType<typeof app.listen>;
  var fixtures: {
    createUserAndToken: (email?: string) => Promise<[User, string, string]>;
  };
}

// setup fixtures
globalThis.fixtures = {
  createUserAndToken: async (absoluteEmail?: string, accessLevels = ["alpha"]): Promise<[User, string, string]> => {
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

    // create a user
    const user = await jestPrisma.client.user.create({
      data: {
        email: email,
        credentials: {
          create: {
            password_hash: hashedPassword!,
          },
        },
        user_access_records: {
          create: {
            access_levels: accessLevels,
            start_date: DateTime.utc().toJSDate(),
          },
        },
      },
    });

    // create a session and a token
    const session = await jestPrisma.client.userSession.create({
      data: {
        user_id: user.id,
        scope: UserSessions.REFRESH_TOKEN_SCOPE,
      },
    });

    const accessTokenPayload = {
      session: session.id,
      id: randomUUID().toString(),
      user: user.id,
      scope: UserSessions.ACCESS_TOKEN_SCOPE,
    };

    const refreshTokenPayload = {
      session: session.id,
      id: session.id,
      user: user.id,
      scope: UserSessions.REFRESH_TOKEN_SCOPE,
    };

    const bearerToken = generateToken(accessTokenPayload, UserSessions.ACCESS_TOKEN_EXP_JWT);
    const refreshToken = generateToken(refreshTokenPayload, UserSessions.REFRESH_TOKEN_EXP_JWT);

    return [user, bearerToken, refreshToken];
  },
};

// setup the jest prisma client and mock
globalThis.testPrisma = jestPrisma.client;

jest.mock("./src/database/prisma", () => {
  return {
    prisma: jestPrisma.client,
  };
});

// just in case there's any extra users hanging around.
beforeEach(async () => {
  await jestPrisma.client.user.deleteMany();
});

// enable the fetch mocks
beforeAll(() => {
  enableFetchMocks();
});

// setup the server object before each test, and tear it down after each test
beforeAll((done) => {
  globalThis.server = app.listen(0, "localhost", done);
});

afterAll((done) => {
  server?.close(done);
});
