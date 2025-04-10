import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { ResetPasswordRequestSchema } from "@recipiece/types";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { ApiResponse } from "../../types";
import { hashPassword } from "../../util/password";

export const resetPassword = async (request: Request<any, any, ResetPasswordRequestSchema>, tx: PrismaTransaction): ApiResponse<{}> => {
  const { password, token } = request.body;

  const accountToken = await tx.userValidationToken.findUnique({
    where: {
      id: token,
      purpose: Constant.UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
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
    milliseconds: Constant.UserValidationTokenTypes.FORGOT_PASSWORD.duration_ms,
  });

  if (now > tokenExpiry) {
    console.log(`${token} was expired!`);
    await tx.userValidationToken.delete({
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
        message: "Unable to reset password",
      },
    ];
  }

  // update the users credentials
  await tx.userCredentials.update({
    where: {
      user_id: accountToken.user_id,
    },
    data: {
      password_hash: hashedPassword,
    },
  });

  // delete any sessions belonging to the user
  await tx.userSession.deleteMany({
    where: {
      user_id: accountToken.user_id,
    },
  });

  // remove the token
  await tx.userValidationToken.delete({
    where: {
      id: token,
    },
  });

  return [StatusCodes.OK, {}];
};
