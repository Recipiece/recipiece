import { PrismaTransaction, shoppingListItemsSubquery, shoppingListSharesSubquery, shoppingListSharesWithMemberships } from "@recipiece/database";
import { ShoppingListSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getShoppingList = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const listId = +request.params.id;

  const query = tx.$kysely
    .selectFrom("shopping_lists")
    .selectAll("shopping_lists")
    .select((eb) => {
      return [shoppingListItemsSubquery(eb).as("items"), shoppingListSharesSubquery(eb, user.id).as("shares")];
    })
    .where((eb) => {
      return eb.and([
        eb("shopping_lists.id", "=", listId),
        eb.or([eb("shopping_lists.user_id", "=", user.id), eb.exists(shoppingListSharesWithMemberships(eb, user.id).select("shopping_list_shares.id").limit(1))]),
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

  return [StatusCodes.OK, list as ShoppingListSchema];
};
