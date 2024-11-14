import { User } from "@prisma/client";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CreateUserRequestSchema } from "../../schema";
import { ApiResponse } from "../../types";
import { hashPassword } from "../../util/password";

export const createUser = async (request: Request<any, any, CreateUserRequestSchema>): ApiResponse<User> => {
  const { username, password } = request.body;

  try {
    const hashedPassword = await hashPassword(password);
    if (!hashPassword) {
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to create account",
        },
      ];
    }

    const insertedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: username,
        },
      });
      await tx.userCredentials.create({
        data: {
          user_id: user.id,
          password_hash: hashedPassword!,
        },
      });

      return user;
    });

    return [StatusCodes.CREATED, insertedUser];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Unable to create account",
      },
    ];
  }
};
