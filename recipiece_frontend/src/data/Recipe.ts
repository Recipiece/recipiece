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
  readonly private?: boolean;
}

export interface ListRecipeFilters {
  readonly page_number: number;
  readonly cookbook_id?: number;
  readonly search?: string;
}

export interface ListRecipesResponse {
  readonly data: Recipe[];
  readonly page: number;
  readonly has_next_page: boolean;
}
