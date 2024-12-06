import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { TimerSchema, UpdateTimerRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateTimer = async (
  request: AuthenticatedRequest<UpdateTimerRequestSchema>
): ApiResponse<TimerSchema> => {
  const timerId = request.body.id;

  const timer = await prisma.timer.findFirst({
    where: {
      user_id: request.user.id,
      id: timerId,
    },
  });

  if (!timer) {
    return [
      StatusCodes.OK,
      {
        message: `Timer ${timerId} not found`,
      },
    ];
  }

  const updatedTimer = await prisma.timer.update({
    where: {
      id: timer.id,
    },
    data: {
      duration_ms: request.body.duration_ms ?? timer.duration_ms,
    },
  });

  return [StatusCodes.OK, updatedTimer];
};
