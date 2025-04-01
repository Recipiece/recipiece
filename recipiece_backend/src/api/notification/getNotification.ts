import { PrismaTransaction } from "@recipiece/database";
import { NotificationSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getNotification = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<NotificationSchema> => {
  const user = request.user;
  const notificationId = +request.params.id;

  const notification = await tx.notification.findFirst({
    where: {
      id: notificationId,
      OR: [
        { user_id: user.id },
        {
          user_kitchen_membership_notification_attachments: {
            some: {
              user_kitchen_membership: {
                destination_user_id: user.id,
                status: "accepted",
              },
            },
          },
        },
      ],
    },
  });

  if (notification) {
    return [StatusCodes.OK, notification];
  }
  return [
    StatusCodes.NOT_FOUND,
    {
      message: `Notification ${notificationId} not found`,
    },
  ];
};
