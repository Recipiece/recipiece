import { StatusCodes } from "http-status-codes";
import { UserSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getUserByToken = async (req: AuthenticatedRequest): ApiResponse<UserSchema> => {
  return [StatusCodes.OK, req.user];
};
