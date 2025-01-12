import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../database";
import { ApiResponse } from "../types";
import { verifyPassword } from "../util/password";

export const basicAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const [responseCode, response] = await runBasicAuth(req.headers.authorization);

  if (responseCode !== StatusCodes.OK) {
    res.status(responseCode).send(response);
  } else {
    // @ts-ignore
    req.user = response;
    next();
  }
};

const runBasicAuth = async (authHeader: string | undefined): ApiResponse<User> => {
  if (!authHeader) {
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Missing authorization header",
      },
    ];
  }

  const stripped = authHeader.replace("Basic", "").trim();
  let username: string;
  let password: string;
  try {
    [username, password] = Buffer.from(stripped, "base64").toString().split(":");
  } catch {
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Malformed basic auth header",
      },
    ];
  }

  if (!username || !password) {
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Username and password must be provided",
      },
    ];
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: username,
        },
        {
          username: username,
        },
      ],
    },
  });

  if (!user) {
    console.log(`could not find user with username ${username}`);
    return [
      StatusCodes.FORBIDDEN,
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
      StatusCodes.FORBIDDEN,
      {
        message: "Username or password is incorrect",
      },
    ];
  }

  const isPasswordValid = await verifyPassword(password, credentials.password_hash);
  if (!isPasswordValid) {
    console.log(`password provided for ${username} does not match stored password hash`);
    return [
      StatusCodes.FORBIDDEN,
      {
        message: "Username or password is incorrect",
      },
    ];
  }

  return [StatusCodes.OK, user];
};
