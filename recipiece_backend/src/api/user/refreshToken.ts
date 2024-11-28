import { DateTime } from "luxon";
import { RefreshTokenResponseSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { UserSessions } from "../../util/constant";
import { prisma } from "../../database";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { generateToken } from "../../util/token";

/**
 * Refresh a user's access token, and also potentially refresh their session if they are close to expiry on that.
 */
export const refreshToken = async (request: AuthenticatedRequest): ApiResponse<RefreshTokenResponseSchema> => {
  let session = request.user_session;
  const sessionExpiry = DateTime.fromJSDate(session.created_at).plus(UserSessions.REFRESH_TOKEN_EXP_LUXON);
  const isCloseToExpiry =
    sessionExpiry.diff(DateTime.utc()).milliseconds < UserSessions.REFRESH_CLOSE_TO_EXPIRY_THRESHOLD_MS;

  if (isCloseToExpiry) {
    console.log(`session ${session.id} is close to expiry, issuing a new session`);

    session = await prisma.$transaction(async (tx) => {
      await tx.userSession.delete({ where: { id: session.id } });
      return tx.userSession.create({
        data: {
          user_id: request.user.id,
          scope: UserSessions.REFRESH_TOKEN_SCOPE,
        },
      });
    });
  }

  const accessTokenPayload = {
    session: session.id,
    id: randomUUID().toString(),
    user: request.user.id,
    scope: UserSessions.ACCESS_TOKEN_SCOPE,
  };

  const refreshTokenPayload = {
    session: session.id,
    id: session.id,
    user: request.user.id,
    scope: UserSessions.REFRESH_TOKEN_SCOPE,
  };

  return [
    StatusCodes.OK,
    {
      access_token: generateToken(accessTokenPayload, UserSessions.ACCESS_TOKEN_EXP_JWT),
      refresh_token: generateToken(refreshTokenPayload, UserSessions.REFRESH_TOKEN_EXP_JWT),
    },
  ];
};
