export interface RecipeStep {
  readonly id: number;
  readonly content: string;
  readonly recipe_id: number;
}

export interface RecipeIngredient {
  readonly id: number;
  readonly name: string;
  readonly unit: string;
}

export interface Recipe {
  readonly id: number;
  readonly name: string;
  readonly user_id: number;
  readonly description: string;
  readonly ingredients: RecipeIngredient[];
  readonly steps: RecipeStep[];
}
