import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteSelf = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const user = request.user;

  await tx.user.delete({
    where: {
      id: user.id,
    },
  });
  return [StatusCodes.OK, {}];
};
