import { Prisma, PrismaClient, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../database";
import { ApiResponse, ErrorResponse } from "../types";
import { verifyPassword } from "../util/password";

export const basicAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.body.username;
  const providedPassword = req.body.password;
  const [responseCode, response] = await runBasicAuth(
    username,
    providedPassword
  );

  if (responseCode !== StatusCodes.OK) {
    res.status(responseCode).send(response);
  } else {
    // @ts-ignore
    req.user = response;
    next();
  }
};

const runBasicAuth = async (
  username?: string,
  password?: string
): ApiResponse<User> => {
  if (!username || !password) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Username and Password must be provided",
      },
    ];
  }

  const user = await prisma.user.findUnique({
    where: {
      email: username,
    },
  });

  if (!user) {
    console.log(`could not find user with username ${username}`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Username or password is incorrect",
      },
    ];
  }

  const credentials = await prisma.userCredentials.findUnique({
    where: {
      user_id: user.id,
    },
  });

  if (!credentials) {
    console.warn(`could not find user credentials for ${username}`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Username or password is incorrect",
      },
    ];
  }

  const isPasswordValid = await verifyPassword(
    password,
    credentials.password_hash
  );
  if (!isPasswordValid) {
    console.log(
      `password provided for ${username} does not match stored password hash`
    );
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Username or password is incorrect",
      },
    ];
  }

  return [StatusCodes.OK, user];
};
