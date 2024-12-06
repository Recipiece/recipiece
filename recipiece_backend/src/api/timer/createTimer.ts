import { StatusCodes } from "http-status-codes";
import { CreateTimerRequestSchema, TimerSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { prisma } from "../../database";

export const createTimer = async (
  request: AuthenticatedRequest<CreateTimerRequestSchema>
): ApiResponse<TimerSchema> => {
  const createdTimer = await prisma.timer.create({
    data: {
      user_id: request.user.id,
      duration_ms: request.body.duration_ms,
    }
  });

  return [StatusCodes.CREATED, createdTimer];
};
