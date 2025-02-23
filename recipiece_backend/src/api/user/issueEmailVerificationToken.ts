import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { sendAccountVerificationEmail } from "../../util/email";
import { Data } from "@recipiece/constant";

export const issueEmailVerificationToken = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const user = request.user;

  const accountToken = await tx.userValidationToken.findFirst({
    where: {
      user_id: user.id,
      purpose: Data.UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
    },
  });

  if (accountToken) {
    // check to see if we have just issued a token and 429 the user if we have
    const now = DateTime.utc();
    const tokenCreatedAt = DateTime.fromJSDate(accountToken.created_at).toUTC();

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

  const createdToken = await tx.userValidationToken.create({
    data: {
      user_id: user.id,
      purpose: Data.UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
    },
  });
  await sendAccountVerificationEmail(user, createdToken);

  return [StatusCodes.CREATED, {}];
};
