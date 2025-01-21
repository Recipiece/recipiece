import { UserPreferencesSchema, UserSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getUserByToken = async (req: AuthenticatedRequest): ApiResponse<UserSchema> => {
  return [
    StatusCodes.OK,
    {
      ...req.user,
      preferences: req.user.preferences as UserPreferencesSchema,
    },
  ];
};
