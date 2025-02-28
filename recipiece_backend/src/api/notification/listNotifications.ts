import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { ListNotificationsQuerySchema, ListNotificationsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listNotifications = async (request: AuthenticatedRequest<any, ListNotificationsQuerySchema>, tx: PrismaTransaction): ApiResponse<ListNotificationsResponseSchema> => {
  const user = request.user;
  const { page_number, page_size } = request.query;
  const pageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;

  const notifications = await tx.notification.findMany({
    where: {
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
    take: pageSize + 1,
    skip: page_number * pageSize,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = notifications.length > pageSize;
  const resultsData = notifications.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
