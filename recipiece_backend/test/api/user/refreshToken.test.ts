import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { RefreshTokenResponseSchema } from "../../../src/schema";
import "jest-expect-message";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../../../src/types";
import { DateTime } from "luxon";
import { UserSessions } from "../../../src/util/constant";
import { prisma } from "../../../src/database";

describe("Refresh Token", () => {
  let user: User;
  let bearerToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
    refreshToken = userAndToken[2];
  });

  it("should refresh the access token", async () => {
    const response = await request(server)
      .post(`/user/refresh-token`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${refreshToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: RefreshTokenResponseSchema = response.body;

    expect(responseBody.access_token).toBeTruthy();
    expect(responseBody.refresh_token, "The refresh token should not have been refreshed").toEqual(refreshToken);
  });

  it("should refresh the refresh token if it is also close to expiry", async () => {
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.APP_SECRET!);
    const sessionId = (decodedRefreshToken as TokenPayload).session;

    const matchingSession = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
      },
    });
    expect(matchingSession).toBeTruthy();

    const timeWithinExpiry = DateTime
      // start with right now
      .utc()
      // take it back 90 days + 10 minutes, which would make it expired
      .minus({ ...UserSessions.REFRESH_TOKEN_EXP_LUXON, minutes: 10 })
      // add in 5 days, which would put it just under the threshold for expiry
      .plus({ milliseconds: UserSessions.REFRESH_CLOSE_TO_EXPIRY_THRESHOLD_MS })
      .toJSDate();

    await prisma.userSession.update({
      where: {
        id: sessionId,
      },
      data: {
        created_at: timeWithinExpiry,
      },
    });

    const response = await request(server)
      .post(`/user/refresh-token`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${refreshToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: RefreshTokenResponseSchema = response.body;

    expect(responseBody.access_token).toBeTruthy();
    expect(responseBody.refresh_token, "The refresh token should have been refreshed").not.toEqual(refreshToken);
  });

  it("should not accept the access token in the authorization header", async () => {
    const response = await request(server)
      .post(`/user/refresh-token`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
  });
});
