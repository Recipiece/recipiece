import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteSelf = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const user = request.user;

  try {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    return [StatusCodes.OK, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to delete account",
      },
    ];
  }
};
