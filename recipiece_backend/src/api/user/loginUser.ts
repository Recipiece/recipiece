import { randomUUID } from "crypto";
import { PrismaTransaction } from "@recipiece/database";
import { LoginResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { UserSessions } from "../../util/constant";
import { generateToken } from "../../util/token";

/**
 * Login the user who has authenticated through basic auth.
 *
 * This will generate an access token and a refresh token. The refresh token is really
 * a session for the user. When we authenticate later on against an access token, we will attempt to
 * find a valid session for the user for that token.
 *
 * When the user logs out, we will kill the session, which will effectively invalidate any access token issued
 * for that session.
 */
export const loginUser = async (
  request: AuthenticatedRequest,
  tx: PrismaTransaction
): ApiResponse<LoginResponseSchema> => {
  const userId = request.user.id;

  const session = await tx.userSession.create({
    data: {
      user_id: userId,
      scope: UserSessions.REFRESH_TOKEN_SCOPE,
    },
  });

  const accessTokenPayload = {
    session: session.id,
    id: randomUUID().toString(),
    user: userId,
    scope: UserSessions.ACCESS_TOKEN_SCOPE,
  };

  const refreshTokenPayload = {
    session: session.id,
    id: session.id,
    user: userId,
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
