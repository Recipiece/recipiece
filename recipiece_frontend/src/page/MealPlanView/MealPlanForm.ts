import { MealPlanItemSchema } from "@recipiece/types";

export interface FormyMealPlanItem extends Omit<MealPlanItemSchema, "id" | "created_at"> {
  readonly created_at?: Date;
  readonly id?: number;
}

export interface MealPlanItemsForm {
  readonly mealPlanItems: ({
    readonly morningItems: FormyMealPlanItem[];
    readonly middayItems: FormyMealPlanItem[];
    readonly eveningItems: FormyMealPlanItem[];
  } | undefined) [];
}
