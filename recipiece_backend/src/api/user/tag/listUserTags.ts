import { prisma } from "@recipiece/database";
import { ListUserTagsQuerySchema, ListUserTagsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { DEFAULT_PAGE_SIZE } from "../../../util/constant";

export const listUserTags = async (request: AuthenticatedRequest<any, ListUserTagsQuerySchema>): ApiResponse<ListUserTagsResponseSchema> => {
  const user = request.user;
  const { page_number, search } = request.query;
  const pageSize = request.query.page_size ?? DEFAULT_PAGE_SIZE;

  let query = prisma.$kysely.selectFrom("user_tags").selectAll("user_tags").where("user_tags.user_id", "=", user.id);

  if (search) {
    query = query.where("user_tags.content", "ilike", `%${search}%`);
  }

  query = query.offset(pageSize * page_number).limit(pageSize + 1);
  const tags = await query.execute();

  const hasNextPage = tags.length > pageSize;
  const resultsData = tags.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
