export interface KnownIngredient {
  readonly id: number;
  readonly created_at: string;
  readonly ingredient_name: string;
  readonly grams: number;
  readonly us_cups: number;
  readonly unitless_amount?: number;
  readonly preferred_measure?: string;
}
