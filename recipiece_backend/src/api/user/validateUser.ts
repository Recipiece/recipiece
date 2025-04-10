import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { ValidateUserRequestSchema, ValidateUserResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const validateUser = async (request: AuthenticatedRequest<ValidateUserRequestSchema>, tx: PrismaTransaction): ApiResponse<ValidateUserResponseSchema> => {
  const { token } = request.body;

  const accountToken = await tx.userValidationToken.findUnique({
    where: {
      id: token,
      purpose: Constant.UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
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
    milliseconds: Constant.UserValidationTokenTypes.ACCOUNT_VERIFICATION.duration_ms,
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
        message: "Unable to verify account",
      },
    ];
  }

  // they passed all the validations, lets verify the account now
  // verify the user
  await tx.user.update({
    where: {
      id: accountToken.user_id,
    },
    data: {
      validated: true,
    },
  });

  // clear out any account verification tokens they may have
  await tx.userValidationToken.deleteMany({
    where: {
      user_id: accountToken.user_id,
      purpose: Constant.UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
    },
  });

  return [
    StatusCodes.OK,
    {
      validated: true,
    },
  ];
};
