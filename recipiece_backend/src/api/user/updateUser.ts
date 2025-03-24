import { Prisma, PrismaTransaction } from "@recipiece/database";
import { UpdateUserRequestSchema, UserPreferencesSchema, UserSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { BadRequestError } from "../../util/error";

export const updateUser = async (request: AuthenticatedRequest<UpdateUserRequestSchema>, tx: PrismaTransaction): ApiResponse<UserSchema> => {
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
    const matchingUser = await tx.user.findFirst({
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
    const matchingUser = await tx.user.findFirst({
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
  if ("preferences" in restBody) {
    updateBody.preferences = { ...restBody.preferences };
  }

  try {
    const updatedUser = await tx.user.update({
      where: {
        id: updateId,
      },
      data: {
        ...updateBody,
      },
    });
    return [
      StatusCodes.OK,
      {
        ...updatedUser,
        preferences: updatedUser.preferences as UserPreferencesSchema,
      },
    ];
  } catch (err) {
    throw new BadRequestError("Cannot update user");
  }
};
