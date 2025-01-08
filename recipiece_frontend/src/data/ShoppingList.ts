import { UserKitchenMembership } from "./User";

export interface ShoppingListItem {
  readonly id: number;
  readonly shopping_list_id: number;
  readonly completed: boolean;
  readonly order: number;
  readonly content: string;
  readonly notes?: string;
}

export interface ShoppingListShare {
  readonly id: number;
  readonly created_at: string;
  readonly shopping_list_id: number;
  readonly user_kitchen_membership_id: number;
}

export interface ShoppingList {
  readonly id: number;
  readonly created_at: string;
  readonly name: string;
  readonly user_id: number;
  readonly shopping_list_items: ShoppingListItem[];
  readonly shares?: ShoppingListShare[];
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

export type ListShoppingListSharesFilters = (
  | {
      readonly targeting_self: boolean;
      readonly from_self?: boolean;
    }
  | {
      readonly targeting_self?: boolean;
      readonly from_self: boolean;
    }
) & {
  readonly user_kitchen_membership_id?: number;
  readonly page_number: number;
};

export interface ListShoppingListSharesResponse {
  readonly data: (ShoppingListShare & { readonly shopping_list: Pick<ShoppingList, "id" | "name"> } & { readonly user_kitchen_membership: UserKitchenMembership })[];
  readonly has_next_page: boolean;
  readonly page: number;
}
