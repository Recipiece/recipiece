import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { TimerSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getTimer = async (request: AuthenticatedRequest): ApiResponse<TimerSchema> => {
  const timerId = request.params.id;

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
        message: `Timer ${timerId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, timer];
};
