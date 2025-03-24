import { prisma, Redis, User, UserSession } from "@recipiece/database";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { ApiResponse, TokenPayload, WebsocketTokenPayload } from "../types";
import { UserSessions } from "../util/constant";
import { verifyToken } from "../util/token";

export const refreshTokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const [responseCode, response] = await runTokenAuth(req.headers.authorization, UserSessions.REFRESH_TOKEN_SCOPE);
  if (responseCode !== StatusCodes.OK) {
    res.status(responseCode).send(response);
  } else {
    // @ts-ignore
    req.user = response.user;
    // @ts-ignore
    req.user_session = response.session;
    next();
  }
};

export const accessTokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const [responseCode, response] = await runTokenAuth(req.headers.authorization);
  if (responseCode !== StatusCodes.OK) {
    res.status(responseCode).send(response);
  } else {
    // @ts-ignore
    req.user = response.user;
    // @ts-ignore
    req.user_session = response.session;
    next();
  }
};

export const wsTokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const wsToken = req.query.token;

  if (!wsToken) {
    res.status(StatusCodes.UNAUTHORIZED).send({ message: "Not authorized" });
  } else {
    const redis = await Redis.getInstance();
    const wsTokenPayload = (await redis.HGETALL(`ws:${wsToken}`)) as unknown as WebsocketTokenPayload;
    if (!wsTokenPayload || wsTokenPayload.purpose !== req.baseUrl) {
      res.status(StatusCodes.UNAUTHORIZED).send({ message: "Not authorized" });
    } else {
      // @ts-ignore
      req.ws_token = wsToken;
      // @ts-ignore
      req.ws_token_payload = wsTokenPayload;
      next();
    }
  }
};

/**
 * Attempts to verify the provided token.
 *
 * This will check that the token
 * 1. is actually a valid token issued by our system
 * 2. that it belongs to a session
 * 3. that it is not expired
 * 4. that the underlying session is not expired
 *
 * If it passes all that, we will return back the user for the token.
 *
 * @param token the token to check
 * @returns the user and the corresponding session
 */
const runTokenAuth = async (token?: string, expectedScope = UserSessions.ACCESS_TOKEN_SCOPE): ApiResponse<{ readonly user: User; readonly session: UserSession }> => {
  if (!token) {
    console.log("no token provided");
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Missing bearer token",
      },
    ];
  }

  const tokenSanitized = token.replace("Bearer", "").trim();

  const decodedToken = verifyToken(tokenSanitized);
  if (!decodedToken) {
    console.log(`token ${decodedToken} could not be verified`);
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Invalid bearer token",
      },
    ];
  }

  const { user: userId, session: sessionId, scope } = decodedToken as TokenPayload;

  if (scope !== expectedScope) {
    console.log(`token has incorrect scope, expected ${expectedScope} but got ${scope}`);
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Not authorized",
      },
    ];
  }

  const session = await prisma.userSession.findFirst({
    where: {
      user_id: userId,
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    console.log(`could not find a session for user ${userId} with id ${sessionId}`);
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Not authorized",
      },
    ];
  }

  // check if the session is expired. If it is, kill the session and 401 the user
  const sessionExpiresAt = DateTime.fromJSDate(session.created_at).plus(UserSessions.REFRESH_TOKEN_EXP_LUXON);
  if (sessionExpiresAt.diffNow().toMillis() < 0) {
    console.log(`${sessionId} is expired, killing session`);

    await prisma.userSession.delete({
      where: {
        id: sessionId,
      },
    });

    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Not authorized",
      },
    ];
  }

  return [StatusCodes.OK, { user: session.user, session: session }];
};
