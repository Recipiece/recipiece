import { StatusCodes } from "http-status-codes";
import { UpdateUserRequestSchema, UserSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { Prisma } from "@prisma/client";
import { prisma } from "../../database";

export const updateUser = async (request: AuthenticatedRequest<UpdateUserRequestSchema>): ApiResponse<UserSchema> => {
  const requestUser = request.user;
  const { id: updateId, ...restBody } = request.body;

  if (requestUser.id !== updateId) {
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Cannot update user",
      },
    ];
  }

  const updateBody: Prisma.UserUpdateInput = {};
  if ("username" in restBody) {
    const matchingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: restBody.username,
          mode: "insensitive",
        },
      },
    });
    if (matchingUser) {
      return [
        StatusCodes.CONFLICT,
        {
          message: "Username already in use",
        },
      ];
    }
    updateBody.username = restBody.username;
  }
  if ("email" in restBody) {
    const matchingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: restBody.email,
          mode: "insensitive",
        },
      },
    });
    if (matchingUser) {
      return [
        StatusCodes.CONFLICT,
        {
          message: "Email already in use",
        },
      ];
    }
    updateBody.email = restBody.email;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: updateId,
      },
      data: {
        ...updateBody,
      },
    });
    return [StatusCodes.OK, updatedUser];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Cannot update user",
      },
    ];
  }
};
