import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ListCookbooksQuerySchema, ListCookbooksResponseSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";

export const listCookbooks = async (
  req: AuthenticatedRequest<any, ListCookbooksQuerySchema>
): ApiResponse<ListCookbooksResponseSchema> => {
  const user = req.user;

  const page = req.query.page_number;
  const pageSize = req.query.page_size || DEFAULT_PAGE_SIZE;
  const userId = req.query.user_id ?? user.id;
  const excludeContainingRecipeId = req.query.exclude_containing_recipe_id;
  const search = req.query.search;

  let where: Prisma.CookbookWhereInput = {
    user_id: userId,
  };

  if (userId && userId !== user.id) {
    where.private = false;
  }

  if (excludeContainingRecipeId) {
    where.recipe_cookbook_attachments = {
      none: {
        recipe_id: excludeContainingRecipeId,
      },
    };
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
