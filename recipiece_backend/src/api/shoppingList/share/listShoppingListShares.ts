import { Constant } from "@recipiece/constant";
import { KyselyCore, PrismaTransaction, ShoppingList } from "@recipiece/database";
import { ListShoppingListSharesQuerySchema, ListShoppingListSharesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const listShoppingListShares = async (
  request: AuthenticatedRequest<any, ListShoppingListSharesQuerySchema>,
  tx: PrismaTransaction
): ApiResponse<ListShoppingListSharesResponseSchema> => {
  const user = request.user;
  const { page_number, page_size, targeting_self, from_self, user_kitchen_membership_id } = request.query;
  const actualPageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;

  if (!targeting_self && !from_self) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Must specify one of from_self or targeting_self",
      },
    ];
  }

  let sharesQuery = tx.$kysely
    .selectFrom("shopping_list_shares")
    .selectAll("shopping_list_shares")
    .select(() => {
      return KyselyCore.sql<ShoppingList>`to_json(shopping_lists.*)`.as("shopping_list");
    })
    .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "shopping_list_shares.user_kitchen_membership_id")
    .innerJoin("shopping_lists", "shopping_list_shares.shopping_list_id", "shopping_lists.id")
    .where((eb) => {
      return eb.or([eb("user_kitchen_memberships.destination_user_id", "=", user.id), eb("user_kitchen_memberships.source_user_id", "=", user.id)]);
    })
    .where((eb) => {
      return eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
    });

  if (targeting_self) {
    sharesQuery = sharesQuery.where("shopping_lists.user_id", "!=", user.id);
  }
  if (from_self) {
    sharesQuery = sharesQuery.where("shopping_lists.user_id", "=", user.id);
  }
  if (user_kitchen_membership_id) {
    sharesQuery = sharesQuery.where("user_kitchen_memberships.id", "=", user_kitchen_membership_id);
  }

  sharesQuery = sharesQuery.offset(page_number * actualPageSize);
  sharesQuery = sharesQuery.limit(actualPageSize + 1);

  const shoppingListShares = await sharesQuery.execute();
  const hasNextPage = shoppingListShares.length > actualPageSize;
  const resultsData = shoppingListShares.splice(0, actualPageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
