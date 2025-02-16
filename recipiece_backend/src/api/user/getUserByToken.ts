import { UserPreferencesSchema, UserSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { PrismaTransaction } from "@recipiece/database";

export const getUserByToken = async (req: AuthenticatedRequest, _: PrismaTransaction): ApiResponse<UserSchema> => {
  return [
    StatusCodes.OK,
    {
      ...req.user,
      preferences: req.user.preferences as UserPreferencesSchema,
    },
  ];
};
