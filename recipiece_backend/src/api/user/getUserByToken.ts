import { StatusCodes } from "http-status-codes";
import { UserSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { JsonObject } from "@prisma/client/runtime/library";

export const getUserByToken = async (req: AuthenticatedRequest): ApiResponse<UserSchema> => {
  return [StatusCodes.OK, {
    ...req.user,
    preferences: req.user.preferences as JsonObject
  }];
};
