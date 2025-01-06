import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CreatePushNotificationRequestSchema, EmptySchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createPushNotificationSubscription = async (
  request: AuthenticatedRequest<CreatePushNotificationRequestSchema>
): ApiResponse<EmptySchema> => {
  const { subscription_data, device_id } = request.body;
  const userId = request.user.id;

  await prisma.userPushNotificationSubscription.upsert({
    where: {
      user_id_device_id: {
        user_id: userId,
        device_id: device_id,
      },
    },
    update: {
      subscription_data: subscription_data,
    },
    create: {
      device_id: device_id,
      subscription_data: subscription_data,
      user_id: userId,
    },
  });

  return [StatusCodes.OK, {}];
};
