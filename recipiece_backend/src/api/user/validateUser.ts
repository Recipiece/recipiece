import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { prisma } from "../../database";
import { ValidateUserRequestSchema, ValidateUserResponseSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { UserValidationTokenTypes } from "../../util/constant";

export const validateUser = async (request: AuthenticatedRequest<ValidateUserRequestSchema>): ApiResponse<ValidateUserResponseSchema> => {
  const { token } = request.body;

  const accountToken = await prisma.userValidationToken.findUnique({
    where: {
      id: token,
      purpose: UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
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
    milliseconds: UserValidationTokenTypes.ACCOUNT_VERIFICATION.duration_ms,
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
        message: "Unable to verify account",
      },
    ];
  }

  // they passed all the validations, lets verify the account now
  await prisma.$transaction(async (tx) => {
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
        purpose: UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
      },
    });
  });

  return [
    StatusCodes.OK,
    {
      validated: true,
    },
  ];
};
