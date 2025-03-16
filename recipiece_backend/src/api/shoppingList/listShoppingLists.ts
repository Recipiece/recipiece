import { Constant } from "@recipiece/constant";
import { KyselyCore, PrismaTransaction } from "@recipiece/database";
import { ListShoppingListsQuerySchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types";
import { shoppingListSharesSubquery } from "./query";

export const listShoppingLists = async (request: AuthenticatedRequest<any, ListShoppingListsQuerySchema>, tx: PrismaTransaction) => {
  const { shared_shopping_lists_filter, page_number, page_size } = request.query;
  const actualPageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;
  const user = request.user;

  let query = tx.$kysely
      .with("owned_shopping_lists", (db) => {
        return db
          .selectFrom("shopping_lists")
          .selectAll("shopping_lists")
          .select((eb) => shoppingListSharesSubquery(eb, user.id).as("shares"))
          .where("shopping_lists.user_id", "=", user.id);
      })
      .with("selective_grant_shared_shopping_lists", (db) => {
        return db
          .selectFrom("shopping_list_shares")
          .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "shopping_list_shares.user_kitchen_membership_id")
          .innerJoin("shopping_lists", "shopping_lists.id", "shopping_list_shares.shopping_list_id")
          .where((eb) => {
            return eb.and([
              eb("user_kitchen_memberships.destination_user_id", "=", user.id),
              eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
            ]);
          })
          .selectAll("shopping_lists")
          .select((eb) => shoppingListSharesSubquery(eb, user.id).as("shares"));
      })
      .with("all_shopping_lists", (db) => {
        if (shared_shopping_lists_filter === "include") {
          return db
            .selectFrom("owned_shopping_lists")
            .union((eb) => {
              return eb.selectFrom("selective_grant_shared_shopping_lists").selectAll();
            })
            .selectAll();
        } else {
          return db.selectFrom("owned_shopping_lists").selectAll();
        }
      })
      .selectFrom("all_shopping_lists")
      .selectAll("all_shopping_lists");

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
