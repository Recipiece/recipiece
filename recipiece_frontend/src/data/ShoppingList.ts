export interface ShoppingListItem {
  readonly id: number;
  readonly shopping_list_id: number;
  readonly completed: boolean;
  readonly order: number;
  readonly content: string;
  readonly notes?: string;
}

export interface ShoppingList {
  readonly id: number;
  readonly created_at: string;
  readonly name: string;
  readonly user_id: number;
  readonly shopping_list_items: ShoppingListItem[];
}

export interface ListShoppingListFilters {
  readonly page_number: number;
  readonly search?: string;
}

export interface ListShoppingListResponse {
  readonly data: ShoppingList[];
  readonly page: number;
  readonly has_next_page: boolean;
}
