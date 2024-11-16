import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ListCookbooksQuerySchema, ListCookbooksResponseSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listCookbooks = async (req: AuthenticatedRequest<any, ListCookbooksQuerySchema>): ApiResponse<ListCookbooksResponseSchema> => {
  const user = req.user;

  const page = req.query.page_number;
  const pageSize = req.query.page_size || 10;
  const userId = req.query.user_id ?? user.id;
  const search = req.query.search;

  let where: Prisma.CookbookWhereInput = {
    user_id: userId,
  };

  if (userId && userId !== user.id) {
    where.private = false;
  }

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const offset = page * pageSize;

  const cookbooks = await prisma.cookbook.findMany({
    where: where,
    skip: offset,
    take: pageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = cookbooks.length > pageSize;
  const resultsData = cookbooks.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page,
    },
  ];
};
