import { ListItemsForMealPlanQuerySchema, ListMealPlanQuerySchema } from "@recipiece/types";
import { RcpQueryKey } from "../QueryKeys";

export class MealPlanQueryKeys {
  public static readonly GET_MEAL_PLAN = (mealPlanId: number): RcpQueryKey => {
    return ["mealPlan", { id: mealPlanId }];
  };

  public static readonly LIST_MEAL_PLANS = (filters?: ListMealPlanQuerySchema): RcpQueryKey => {
    const base: RcpQueryKey = ["listMealPlans"];

    if (filters) {
      const { page_number } = filters;
      if (page_number) {
        base.push({ page_number });
      }
    }

    return base;
  };

  public static readonly LIST_MEAL_PLAN_ITEMS = (mealPlanId: number, filters?: ListItemsForMealPlanQuerySchema): RcpQueryKey => {
    const base: RcpQueryKey = [
      "listMealPlanItems",
      {
        meal_plan_id: mealPlanId,
      },
    ];

    if (filters) {
      const { start_date, end_date } = filters;
      if (start_date) {
        base.push({ start_date });
      }
      if (end_date) {
        base.push({ end_date });
      }
    }

    return base;
  };
}
