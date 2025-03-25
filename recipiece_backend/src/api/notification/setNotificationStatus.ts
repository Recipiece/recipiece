import { PrismaTransaction } from "@recipiece/database";
import { NotificationSchema, SetNotificationStatusRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const setNotificationStatus = async (request: AuthenticatedRequest<SetNotificationStatusRequestSchema>, tx: PrismaTransaction): ApiResponse<NotificationSchema> => {
  const user = request.user;
  const { status, id: notificationId } = request.body;

  const notification = await tx.notification.findFirst({
    where: {
      id: notificationId,
      OR: [
        { user_id: user.id },
        {
          user_kitchen_membership_notification_attachments: {
            every: {
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

  if (!notification) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Notification ${notificationId} not found`,
      },
    ];
  }

  const updated = await tx.notification.update({
    where: {
      id: notification.id,
    },
    data: {
      status: status,
      read_at: status === "read" ? DateTime.utc().toJSDate() : null,
      read_by_user_id: status === "read" ? user.id : null,
    },
  });
  return [StatusCodes.OK, updated];
};
