import { Prisma, ShoppingListItem } from "@prisma/client";
import { prisma } from "../../database";

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
  tx?: Prisma.TransactionClient
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
