import { User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { UserValidationTokenTypes } from "../../util/constant";
import { sendAccountVerificationEmail } from "../../util/email";

export const issueEmailVerificationToken = async (req: AuthenticatedRequest, res: Response) => {
  const [responseCode, response] = await runIssueEmailVerificationToken(req.user);
  res.status(responseCode).send(response);
};

export const runIssueEmailVerificationToken = async (user: User): ApiResponse<{}> => {
  const accountToken = await prisma.userValidationToken.findFirst({
    where: {
      user_id: user.id,
      purpose: UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
    },
  });

  if (accountToken) {
    // check to see if we have just issued a token and 429 the user if we have
    const now = DateTime.utc();
    const tokenCreatedAt = DateTime.fromJSDate(accountToken.created_at).toUTC();

    console.log(now);
    console.log(tokenCreatedAt);
    console.log(now.diff(tokenCreatedAt).milliseconds)

    const diffMs = now.diff(tokenCreatedAt).milliseconds;

    if (diffMs < 5 * 60 * 1000) {
      return [
        StatusCodes.TOO_MANY_REQUESTS,
        {
          message: "Another token was recently issued to this user. Try again later.",
        },
      ];
    }
  }

  await prisma.$transaction(async (tx) => {
    const createdToken = await tx.userValidationToken.create({
      data: {
        user_id: user.id,
        purpose: UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
      },
    });
    await sendAccountVerificationEmail(user, createdToken);
  });

  return [StatusCodes.CREATED, {}];
};
