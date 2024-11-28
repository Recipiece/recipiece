import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { prisma } from "../../database";
import { ResetPasswordRequestSchema } from "../../schema";
import { ApiResponse } from "../../types";
import { UserValidationTokenTypes } from "../../util/constant";
import { hashPassword } from "../../util/password";

export const resetPassword = async (request: Request<any, any, ResetPasswordRequestSchema>): ApiResponse<{}> => {
  const { password, token } = request.body;

  const accountToken = await prisma.userValidationToken.findUnique({
    where: {
      id: token,
      purpose: UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    },
  });

  if (!accountToken) {
    console.log(`no token found for ${token}`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Unable to verify account",
      },
    ];
  }

  const now = DateTime.utc();
  const tokenExpiry = DateTime.fromJSDate(accountToken.created_at).plus({
    milliseconds: UserValidationTokenTypes.FORGOT_PASSWORD.duration_ms,
  });

  if (now > tokenExpiry) {
    console.log(`${token} was expired!`);
    await prisma.userValidationToken.delete({
      where: {
        id: token,
      },
    });

    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Unable to reset password",
      },
    ];
  }

  const hashedPassword = await hashPassword(password);
  if (!hashedPassword) {
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to create account",
      },
    ];
  }

  await prisma.userCredentials.update({
    where: {
      user_id: accountToken.user_id,
    },
    data: {
      password_hash: hashedPassword,
    },
  });

  await prisma.userValidationToken.delete({
    where: {
      id: token,
    },
  });

  return [StatusCodes.OK, {}];
};
