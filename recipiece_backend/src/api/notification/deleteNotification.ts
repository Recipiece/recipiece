import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteNotification = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
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

  if (!notification) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Notification ${notification} not found`,
      },
    ];
  }

  await tx.notification.delete({
    where: {
      id: notification.id,
    },
  });
  return [StatusCodes.OK, {}];
};
