import { ListShoppingListFilters } from "../../data";

export class ShoppingListQueryKeys {
  public static readonly GET_SHOPPING_LIST = (listId: number) => {
    return ["shoppingList", { id: listId }];
  };

  public static readonly LIST_SHOPPING_LISTS = (filters?: ListShoppingListFilters) => {
    const base: any[] = ["listShoppingLists"];

    if (filters) {
      const { page_number, search } = filters;
      if (page_number) {
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
}
