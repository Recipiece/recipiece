export interface Cookbook {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly created_at: string;
  readonly private?: boolean;
  readonly user_id: number;
}

export interface ListCookbookFilters {
  readonly page: number;
  readonly search?: string;
}
