import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ValidateUserSchema, YValidateUserSchema } from "../../schema";
import { ApiResponse } from "../../types";
import { UserValidationTokenTypes } from "../../util/constant";
import { DateTime } from "luxon";

export const validateUser = async (req: Request, res: Response) => {
  const [responseCode, response] = await runValidateUser(req.body);
  res.status(responseCode).send(response);
};

export const runValidateUser = async (body: any): ApiResponse<{ validated: boolean }> => {
  let validateSchema: ValidateUserSchema;
  try {
    validateSchema = await YValidateUserSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to create a recipe",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

  const accountToken = await prisma.userValidationToken.findUnique({
    where: {
      id: validateSchema.token,
      purpose: UserValidationTokenTypes.ACCOUNT_VERIFICATION.purpose,
    },
  });

  if (!accountToken) {
    console.log(`no token found for ${validateSchema.token}`);
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
    console.log(`${validateSchema.token} was expired!`);
    await prisma.userValidationToken.delete({
      where: {
        id: validateSchema.token,
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
