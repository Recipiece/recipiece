import { PrismaTransaction } from "@recipiece/database";
import { CreatePushNotificationRequestSchema, EmptySchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createPushNotificationSubscription = async (request: AuthenticatedRequest<CreatePushNotificationRequestSchema>, tx: PrismaTransaction): ApiResponse<EmptySchema> => {
  const { subscription_data, device_id } = request.body;
  const userId = request.user.id;

  /**
   * This should handle the case where
   * 1. User A logged into a device
   * 2. User A enabled push notifications
   * 3. User A logged out of the device
   * 4. User B logged into the device
   * 5. Uh oh, now user B is getting push notifications meant for user A
   */
  const existingSubscription = await tx.userPushNotificationSubscription.findFirst({
    where: {
      device_id: device_id,
    },
  });
  if (existingSubscription && existingSubscription.user_id !== userId) {
    return [
      StatusCodes.GONE,
      {
        message: "Subscription gone.",
      },
    ];
  }

  await tx.userPushNotificationSubscription.upsert({
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
