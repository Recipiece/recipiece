import { CreateTimerRequestSchema, TimerSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { timersQueue } from "../../job";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createTimer = async (request: AuthenticatedRequest<CreateTimerRequestSchema>): ApiResponse<TimerSchema> => {
  const createdTimer = await prisma.timer.create({
    data: {
      user_id: request.user.id,
      duration_ms: request.body.duration_ms,
    },
  });

  // enqueue the timer ending into the timers queue
  await timersQueue.add(`timer${createdTimer.id}`, createdTimer, {
    delay: createdTimer.duration_ms,
    removeOnComplete: true,
    removeOnFail: true,
    jobId: `timer${createdTimer.id}`,
  });

  return [StatusCodes.CREATED, createdTimer];
};
