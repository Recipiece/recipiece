import { ListShoppingListFilters, ListShoppingListSharesFilters } from "../../data";

export class ShoppingListQueryKeys {
  public static readonly GET_SHOPPING_LIST = (listId: number) => {
    return ["shoppingList", { id: listId }];
  };

  public static readonly LIST_SHOPPING_LISTS = (filters?: ListShoppingListFilters) => {
    const base: any[] = ["listShoppingLists"];

    if (filters) {
      const { page_number, search } = filters;
      if (page_number !== undefined) {
        base.push({ page_number });
      }
      if (search) {
        base.push({ search });
      }
    }

    return base;
  };

  public static readonly GET_SHOPPING_LIST_SESSION = (listId: number) => {
    return ["shoppingListSession", { id: listId }];
  };

  public static readonly LIST_SHOPPING_LIST_SHARES = (filters?: ListShoppingListSharesFilters) => {
    const base: any[] = ["listShoppingListShares"];

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

  public static readonly GET_SHOPPING_LIST_SHARE = (id: number) => {
    return ["shoppingListShare", { id }];
  };
}
