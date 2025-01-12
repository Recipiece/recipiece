import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ShoppingListSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { itemsSubquery, sharesSubquery, sharesWithMemberships } from "./util";

export const getShoppingList = async (request: AuthenticatedRequest): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const listId = +request.params.id;

  const query = prisma.$kysely
    .selectFrom("shopping_lists")
    .selectAll("shopping_lists")
    .select((eb) => {
      return [itemsSubquery(eb).as("items"), sharesSubquery(eb, user.id).as("shares")];
    })
    .where((eb) => {
      return eb.and([
        eb("shopping_lists.id", "=", listId),
        eb.or([
          eb("shopping_lists.user_id", "=", user.id),
          eb.exists(sharesWithMemberships(eb, user.id).select("shopping_list_shares.id").limit(1)),
        ]),
      ]);
    });

  const list = await query.executeTakeFirst();

  if (!list) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping List ${listId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, list];
};
