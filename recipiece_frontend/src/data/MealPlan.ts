import { Recipe } from "./Recipe";

export interface MealPlanItem {
  readonly id: number;
  readonly meal_plan_id: number;
  readonly start_date: string;
  readonly freeform_content?: string;
  readonly notes?: string;
  readonly recipe_id?: number;
  readonly recipe?: Recipe;
}

export interface MealPlan {
  readonly id: number;
  readonly name: string;
  readonly duration: string;
  readonly created_at: string;
  readonly start_date: string;
}

export interface ListMealPlanFilters {
  readonly page_number: number;
  readonly search?: string;
}

export interface ListMealPlanResponse {
  readonly data: MealPlan[];
  readonly page: number;
  readonly has_next_page: boolean;
}

export interface ListMealPlanItemsFilters {
  readonly start_date?: string;
  readonly end_date?: string;
}

export interface ListMealPlanItemsResponse {
  readonly meal_plan_items: MealPlanItem[];
}