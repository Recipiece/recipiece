import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { verifyToken } from "../../../src/util/token";
import { TokenPayload } from "../../../src/types";
import { prisma } from "../../../src/database";

describe("Logout User", () => {
  let user: User;
  let bearerToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
    refreshToken = userAndToken[2];
  });

  it("should remove the user session", async () => {
    const response = await request(server)
      .post(`/user/logout`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const decodedRefreshToken = verifyToken(refreshToken) as TokenPayload;
    expect(decodedRefreshToken).toBeTruthy();

    const {session: sessionId} = decodedRefreshToken;
    const matchingSession = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
      }
    });
    expect(matchingSession).toBeFalsy();
  });
});
