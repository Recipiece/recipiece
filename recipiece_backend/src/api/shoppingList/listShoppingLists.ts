import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types";
import { ListShoppingListsQuerySchema } from "../../schema";
import { Prisma } from "@prisma/client";
import { prisma } from "../../database";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";

export const listShoppingLists = async (request: AuthenticatedRequest<any, ListShoppingListsQuerySchema>) => {
  const query = request.query;
  const user = request.user;

  const userId = query.user_id ?? user.id;
  const pageSize = query.page_size || DEFAULT_PAGE_SIZE;
  const page = query.page_number;
  const search = query.search;

  let where: Prisma.ShoppingListWhereInput = {
    user_id: userId,
  };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const offset = page * pageSize;

  const shoppingLists = await prisma.shoppingList.findMany({
    where: where,
    skip: offset,
    take: pageSize + 1,
    orderBy: {
      created_at: "desc",
    },
    include: {
      shopping_list_items: true,
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
