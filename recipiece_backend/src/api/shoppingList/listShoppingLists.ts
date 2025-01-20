import { prisma, shoppingListItemsSubquery, shoppingListSharesSubquery, shoppingListSharesWithMemberships } from "@recipiece/database";
import { ListShoppingListsQuerySchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";

export const listShoppingLists = async (request: AuthenticatedRequest<any, ListShoppingListsQuerySchema>) => {
  const { shared_shopping_lists, page_number, page_size } = request.query;
  const actualPageSize = page_size ?? DEFAULT_PAGE_SIZE;
  const user = request.user;

  let query = prisma.$kysely
    .selectFrom("shopping_lists")
    .selectAll("shopping_lists")
    .select((eb) => {
      return [shoppingListItemsSubquery(eb).as("items"), shoppingListSharesSubquery(eb, user.id).as("shares")];
    })
    .where((eb) => {
      if (shared_shopping_lists === "include") {
        return eb.or([eb("shopping_lists.user_id", "=", user.id), eb.exists(shoppingListSharesWithMemberships(eb, user.id).select("shopping_list_shares.id").limit(1))]);
      } else {
        return eb("shopping_lists.user_id", "=", user.id);
      }
    });

  query = query.offset(page_number * actualPageSize).limit(actualPageSize + 1);
  const shoppingLists = await query.execute();

  const hasNextPage = shoppingLists.length > actualPageSize;
  const resultsData = shoppingLists.splice(0, actualPageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
