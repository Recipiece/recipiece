import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { PrismaTransaction } from "@recipiece/database";
import { IssueForgotPasswordTokenRequestSchema } from "@recipiece/types";
import { ApiResponse } from "../../types";
import { UserValidationTokenTypes } from "../../util/constant";
import { sendForgotPasswordEmail } from "../../util/email";

export const issueForgotPasswordToken = async (request: Request<any, any, IssueForgotPasswordTokenRequestSchema>, tx: PrismaTransaction): ApiResponse<{}> => {
  const { username_or_email } = request.body;

  const matchingUser = await tx.user.findFirst({
    where: {
      OR: [
        {
          email: username_or_email,
        },
        {
          username: username_or_email,
        },
      ],
    },
  });

  if (!matchingUser) {
    return [StatusCodes.CREATED, {}];
  }

  const accountToken = await tx.userValidationToken.findFirst({
    where: {
      user_id: matchingUser.id,
      purpose: UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    },
  });

  if (accountToken) {
    // check to see if we have just issued a token and 429 the user if we have
    const now = DateTime.utc();
    const tokenCreatedAt = DateTime.fromJSDate(accountToken.created_at).toUTC();

    const diffMs = now.diff(tokenCreatedAt).milliseconds;

    if (diffMs < UserValidationTokenTypes.TOKEN_COOLDOWN_MS) {
      return [
        StatusCodes.TOO_MANY_REQUESTS,
        {
          message: "Another token was recently issued to this email address. Try again later.",
        },
      ];
    }
  }

  const createdToken = await tx.userValidationToken.create({
    data: {
      user_id: matchingUser.id,
      purpose: UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    },
  });
  await sendForgotPasswordEmail(matchingUser, createdToken);

  return [StatusCodes.CREATED, {}];
};
