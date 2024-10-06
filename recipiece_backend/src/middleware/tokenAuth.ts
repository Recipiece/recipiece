import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../types";
import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../util/token";
import { prisma, Redis } from "../database";

export const tokenAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [responseCode, response] = await runTokenAuth(
    req.headers.authorization
  );
  if (responseCode !== StatusCodes.OK) {
    res.status(responseCode).send(response);
  } else {
    // @ts-ignore
    req.user = response;
    next();
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
    console.log("token could not be verified");
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Not authorized",
      },
    ];
  }

  const usernameFromToken = (decodedToken as { readonly user: string }).user;
  if (!usernameFromToken) {
    console.log(
      `could not determine username from token payload: ${decodedToken}`
    );
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
