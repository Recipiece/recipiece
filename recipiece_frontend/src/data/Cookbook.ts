export interface Cookbook {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly created_at: string;
  readonly user_id: number;
}

export interface ListCookbookFilters {
  readonly page_number: number;
  readonly search?: string;
  readonly exclude_containing_recipe_id?: number;
}
