import { prisma, User } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { TokenPayload } from "../../../src/types";
import { verifyToken } from "../../../src/util/token";

describe("Logout User", () => {
  let user: User;
  let bearerToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    [user, bearerToken, refreshToken] = await fixtures.createUserAndToken();
  });

  it("should remove the user session", async () => {
    const response = await request(server).post(`/user/logout`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const decodedRefreshToken = verifyToken(refreshToken) as TokenPayload;
    expect(decodedRefreshToken).toBeTruthy();

    const { session: sessionId } = decodedRefreshToken;
    const matchingSession = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
      },
    });
    expect(matchingSession).toBeFalsy();
  });
});
