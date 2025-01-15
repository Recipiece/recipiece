import { ShoppingListItem } from "@prisma/client";
import { ShoppingListItemSchema, ShoppingListShareSchema } from "@recipiece/types";
import { ExpressionBuilder, sql } from "kysely";
import { DB, prisma } from "../../database";

export const MAX_NUM_ITEMS = 100000;

/**
 * Takes all the items in the provided shopping list and aligns their order so that there's no out-of-order entities
 *
 * @param shoppingListId the id of the shopping list
 * @param tx an optional transaction object, if we're running the collapse in a transaction
 * @returns the shopping list items that were affected, which should be all shopping list items belonging to the shopping list
 */
export const collapseOrders = async (
  shoppingListId: number,
  tx?: any
): Promise<ShoppingListItem[]> => {
  return (await (tx ?? prisma).$queryRaw`
    with updated as (
      update
        shopping_list_items
      set
        "order" = ord_sq.order_in_row
      from
        (
          select
            id,
            row_number () over (
              partition by completed
              order by "order"
            ) as order_in_row
          from
            shopping_list_items
          where
            shopping_list_items.shopping_list_id = ${shoppingListId}
        ) as ord_sq
      where
        ord_sq.id = shopping_list_items.id
      returning
        shopping_list_items.*
    )
    select * from updated
    order by
      completed asc,
      "order" asc
    ;
  `) as unknown as ShoppingListItem[];
};


export const sharesWithMemberships = (eb: ExpressionBuilder<DB, "shopping_lists">, userId: number) => {
  return eb
    .selectFrom("shopping_list_shares")
    .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "shopping_list_shares.user_kitchen_membership_id")
    .whereRef("shopping_list_shares.shopping_list_id", "=", "shopping_lists.id")
    .where((eb) => {
      return eb.and([
        eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
        eb.or([
          eb("user_kitchen_memberships.destination_user_id", "=", userId),
          eb("user_kitchen_memberships.source_user_id", "=", userId),
        ]),
      ]);
    });
};

export const sharesSubquery = (eb: ExpressionBuilder<DB, "shopping_lists">, userId: number) => {
  return sharesWithMemberships(eb, userId).select(
    sql<ShoppingListShareSchema[]>`
      coalesce(
        jsonb_agg(shopping_list_shares.*),
        '[]'
      )
      `.as("shares_aggregate")
  );
};

export const itemsSubquery = (eb: ExpressionBuilder<DB, "shopping_lists">) => {
  return eb
    .selectFrom("shopping_list_items")
    .whereRef("shopping_list_items.shopping_list_id", "=", "shopping_lists.id")
    .select(
      sql<ShoppingListItemSchema[]>`
      coalesce(
        jsonb_agg(shopping_list_items.* order by shopping_list_items."order" asc),
        '[]'
      )  
      `.as("items_aggregate")
    );
};
