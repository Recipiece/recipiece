import { User } from "@prisma/client";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { prisma } from "../../database";
import { CreateUserRequestSchema } from "../../schema";
import { ApiResponse } from "../../types";
import { VERSION_ACCESS_LEVELS } from "../../util/constant";
import { hashPassword } from "../../util/password";

export const createUser = async (request: Request<any, any, CreateUserRequestSchema>): ApiResponse<User> => {
  const { username, email, password } = request.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
        {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  if (existingUser) {
    return [
      StatusCodes.CONFLICT,
      {
        message: "Username or Email already in use.",
      },
    ];
  }

  try {
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
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
          email: email,
          username: username,
          preferences: {
            account_visibility: "protected",
          },
          credentials: {
            create: {
              password_hash: hashedPassword!,
            },
          },
          user_access_records: {
            create: {
              access_levels: VERSION_ACCESS_LEVELS[process.env.APP_VERSION!] ?? ["free"],
              start_date: DateTime.utc().toJSDate(),
            },
          },
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
