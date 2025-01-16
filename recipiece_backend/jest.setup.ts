/**
 * In this file, we
 * 1. setup the global transactional prisma object
 * 2. Spin up and shut down the supertest server
 * 3. Initialize any globally available fixtures
 *
 * This allows each test to run in a transaction, and also injects the transactional prisma down into
 * the actual api calls that are being made.
 */

import { User, prisma } from "@recipiece/database";
import { UserPreferencesSchema } from "@recipiece/types";
import { randomUUID } from "crypto";
import { enableFetchMocks } from "jest-fetch-mock";
import app from "./src/app";
import { UserSessions } from "./src/util/constant";
import { hashPassword } from "./src/util/password";
import { generateToken } from "./src/util/token";

interface CreateUserAndTokenArgs {
  readonly email?: string;
  readonly username?: string;
  readonly password?: string;
  readonly preferences?: UserPreferencesSchema;
}

declare global {
  // var testPrisma: typeof jestPrisma.client;
  var server: ReturnType<typeof app.listen>;
  var fixtures: {
    createUserAndToken: (opts?: CreateUserAndTokenArgs) => Promise<[User, string, string]>;
  };
}

// setup fixtures
globalThis.fixtures = {
  createUserAndToken: async (opts?: CreateUserAndTokenArgs): Promise<[User, string, string]> => {
    function stringGen(len: number) {
      var text = "";
      var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < len; i++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      return text;
    }

    const email = opts?.email ?? `${stringGen(15)}@${stringGen(5)}.${stringGen(3)}`;
    const username = opts?.username ?? stringGen(10);
    const password = opts?.password ?? stringGen(10);
    const preferences = opts?.preferences ?? {
      account_visibility: "protected",
    };
    const hashedPassword = await hashPassword(password);

    // create a user
    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        preferences: preferences,
        credentials: {
          create: {
            password_hash: hashedPassword!,
          },
        },
        // user_access_records: {
        //   create: {
        //     access_levels: accessLevels,
        //     start_date: DateTime.utc().toJSDate(),
        //   },
        // },
      },
    });

    // create a session and a token
    const session = await prisma.userSession.create({
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

jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn(),
      };
    }),
    Worker: jest.fn().mockImplementation(),
  };
});

// just in case there's any extra users hanging around.
beforeEach(async () => {
  await prisma.user.deleteMany();
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
