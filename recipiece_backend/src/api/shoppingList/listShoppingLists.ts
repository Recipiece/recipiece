import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types";

export const listShoppingLists = async (request: AuthenticatedRequest<any>) => {
  return [StatusCodes.NOT_IMPLEMENTED, {}];
};
