import { ListShoppingListSharesQuerySchema, ListShoppingListsQuerySchema } from "@recipiece/types";
import { RcpQueryKey } from "../QueryKeys";

export class ShoppingListQueryKeys {
  public static readonly GET_SHOPPING_LIST = (listId?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["shoppingList"];

    if (listId) {
      base.push({ id: listId });
    }

    return base;
  };

  public static readonly LIST_SHOPPING_LISTS = (filters?: Partial<ListShoppingListsQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listShoppingLists"];

    if (filters) {
      const { page_number } = filters;
      if (page_number !== undefined) {
        base.push({ page_number });
      }
    }

    return base;
  };

  public static readonly GET_SHOPPING_LIST_SESSION = (listId: number): RcpQueryKey => {
    return ["shoppingListSession", { id: listId }];
  };

  public static readonly LIST_SHOPPING_LIST_SHARES = (filters?: Partial<ListShoppingListSharesQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listShoppingListShares"];

    const { targeting_self, from_self, page_number, user_kitchen_membership_id } = filters ?? {};
    if (targeting_self !== undefined) {
      base.push({ targeting_self });
    }
    if (from_self !== undefined) {
      base.push({ from_self });
    }
    if (page_number !== undefined) {
      base.push({ page_number });
    }
    if (user_kitchen_membership_id) {
      base.push({ user_kitchen_membership_id });
    }
    return base;
  };

  public static readonly GET_SHOPPING_LIST_SHARE = (id?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["shoppingListShare"];

    if (id) {
      base.push({ id });
    }

    return base;
  };
}
