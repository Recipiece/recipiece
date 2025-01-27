export interface MealPlanNotificationData {
  readonly meal_plan_id: number;
  readonly meal_plan_item_id: number;
  readonly ingredient_name: string;
  readonly ingredient_amount?: string;
  readonly ingredient_unit?: string;
}
