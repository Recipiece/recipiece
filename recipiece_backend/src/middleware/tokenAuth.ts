import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma, Redis } from "../database";
import { ApiResponse, WebsocketTokenPayload } from "../types";
import { verifyToken } from "../util/token";

export const tokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const [responseCode, response] = await runTokenAuth(req.headers.authorization);
  if (responseCode !== StatusCodes.OK) {
    res.status(responseCode).send(response);
  } else {
    // @ts-ignore
    req.user = response;
    next();
  }
};

export const wsTokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const wsToken = req.query.token;

  if(!wsToken) {
    res.status(StatusCodes.UNAUTHORIZED).send({message: "Not authorized"});
  } else {
    const redis = await Redis.getInstance();
    const wsTokenPayload = (await redis.HGETALL(`ws:${wsToken}`) as unknown as WebsocketTokenPayload);
    if(!wsTokenPayload || wsTokenPayload.purpose !== req.baseUrl) {
      res.status(StatusCodes.UNAUTHORIZED).send({message: "Not authorized"});
    } else {
      // @ts-ignore
      req.ws_token = wsToken;
      // @ts-ignore
      req.ws_token_payload = wsTokenPayload;
      next();
    }
  }
};

const runTokenAuth = async (token?: string): ApiResponse<User> => {
  if (!token) {
    console.log("no token provided");
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Not authorized",
      },
    ];
  }

  const tokenSanitized = token.replace("Bearer", "").trim();

  const redis = await Redis.getInstance();
  const isBlacklisted = await redis.get(tokenSanitized);
  if (isBlacklisted) {
    console.log("token was forcibly blacklisted");
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Not authorized",
      },
    ];
  }

  const decodedToken = verifyToken(tokenSanitized);
  if (!decodedToken) {
    console.log(`token ${decodedToken} could not be verified`);
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Not authorized",
      },
    ];
  }

  const usernameFromToken = (decodedToken as { readonly user: string }).user;
  if (!usernameFromToken) {
    console.log(`could not determine username from token payload: ${decodedToken}`);
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Not authorized",
      },
    ];
  }

  const user = await prisma.user.findFirst({
    where: {
      email: usernameFromToken,
    },
  });

  if (!user) {
    console.log(`could not find user with username ${usernameFromToken}`);
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Not authorized",
      },
    ];
  }

  return [StatusCodes.OK, user];
};
