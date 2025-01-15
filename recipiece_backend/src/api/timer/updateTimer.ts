import { TimerSchema, UpdateTimerRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { timersQueue } from "../../scheduledJobs";
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

  // update the job if there is one in the timers queue
  const job = await timersQueue.getJob(`timer${updatedTimer.id}`);
  if (job) {
    try {
      await job.changeDelay(updatedTimer.duration_ms);
    } catch (err) {
      console.log(`could not change timer delay for timer ${updatedTimer.id}`);
      console.error(err);
    }
  }

  return [StatusCodes.OK, updatedTimer];
};
