import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteTimer = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const timerId = +request.params.id;

  const timer = await prisma.timer.findFirst({
    where: {
      id: timerId,
      user_id: request.user.id,
    },
  });

  if (!timer) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Timer ${timerId} was not found`,
      },
    ];
  }

  await prisma.timer.delete({
    where: {
      id: timerId,
    },
  });

  return [StatusCodes.OK, {}];
};
