import { StatusCodes } from "http-status-codes";
import { ConvertIngredientRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const convertIngredient = async (req: AuthenticatedRequest<ConvertIngredientRequestSchema>): ApiResponse<void> => {
  return [StatusCodes.NOT_IMPLEMENTED, { message: "nope" }];
};
