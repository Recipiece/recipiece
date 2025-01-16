import { Prisma, prisma } from "@recipiece/database";
import { ListTimersQuerySchema, ListTimersResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";

export const listTimers = async (
  request: AuthenticatedRequest<any, ListTimersQuerySchema>
): ApiResponse<ListTimersResponseSchema> => {
  const query = request.query;
  const user = request.user;

  const userId = query.user_id ?? user.id;
  const pageSize = query.page_size || DEFAULT_PAGE_SIZE;
  const page = query.page_number;

  let where: Prisma.TimerWhereInput = {
    user_id: userId,
  };

  const offset = page * pageSize;

  const shoppingLists = await prisma.timer.findMany({
    where: where,
    skip: offset,
    take: pageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = shoppingLists.length > pageSize;
  const resultsData = shoppingLists.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page,
    },
  ];
};
