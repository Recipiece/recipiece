import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { timersQueue } from "../../scheduledJobs";

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

  // we removed a timer, so purge it out of the queue
  const timersJob = await timersQueue.getJob(`timer${timerId}`);
  if(timersJob) {
    await timersJob.remove(); 
  }

  return [StatusCodes.OK, {}];
};
