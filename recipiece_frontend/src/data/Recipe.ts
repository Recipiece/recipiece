import { UserKitchenMembership } from "./User";

export interface RecipeStep {
  readonly id: number;
  readonly content: string;
  readonly recipe_id: number;
  readonly order: number;
}

export interface RecipeIngredient {
  readonly id: number;
  readonly name: string;
  readonly unit?: string;
  readonly amount?: string;
  readonly recipe_id: number;
  readonly order: number;
}

export interface Recipe {
  readonly id: number;
  readonly name: string;
  readonly created_at: string;
  readonly user_id: number;
  readonly description: string;
  readonly ingredients: RecipeIngredient[];
  readonly steps: RecipeStep[];
  readonly duration_ms?: number;
  readonly servings?: number;
  readonly shares?: RecipeShare[];
}

export interface ListRecipeFilters {
  readonly page_number: number;
  readonly cookbook_id?: number;
  readonly search?: string;
  readonly shared_recipes?: "include" | "exclude";
  readonly cookbook_attachments?: "include" | "exclude";
}

export interface ListRecipesResponse {
  readonly data: Recipe[];
  readonly page: number;
  readonly has_next_page: boolean;
}

export interface RecipeShare {
  readonly id: number;
  readonly created_at: string;
  readonly recipe_id: number;
  readonly user_kitchen_membership_id: number;
}

export type ListRecipeSharesFilters = (
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

export interface ListRecipeSharesResponse {
  readonly data: (RecipeShare & { readonly recipe: Pick<Recipe, "id" | "name"> } & { readonly user_kitchen_membership: UserKitchenMembership })[];
  readonly has_next_page: boolean;
  readonly page: number;
}
