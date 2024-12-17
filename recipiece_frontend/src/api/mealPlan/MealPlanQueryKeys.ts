import { ListMealPlanFilters, ListMealPlanItemsFilters } from "../../data";

export class MealPlanQueryKeys {
  public static readonly GET_MEAL_PLAN = (mealPlanId: number) => {
    return ["mealPlan", { id: mealPlanId }];
  };

  public static readonly LIST_MEAL_PLANS = (filters?: ListMealPlanFilters) => {
    const base: any[] = ["listMealPlans"];

    if (filters) {
      const { page_number, search } = filters;
      if (page_number) {
        base.push({ page_number });
      }
      if (search) {
        base.push({ search });
      }
    }

    return base;
  };

  public static readonly LIST_MEAL_PLAN_ITEMS = (mealPlanId: number, filters?: ListMealPlanItemsFilters) => {
    const base: any[] = ["listMealPlanItems", {
      meal_plan_id: mealPlanId,
    }];

    if(filters) {
      const {start_date, end_date} = filters;
      if(start_date) {
        base.push({ start_date })
      }
      if(end_date) {
        base.push({ end_date });
      }
    }

    return base;
  }
}
