import { ListItemsForMealPlanQuerySchema, ListMealPlanSharesQuerySchema, ListMealPlansQuerySchema } from "@recipiece/types";
import { RcpQueryKey } from "../QueryKeys";

export class MealPlanQueryKeys {
  public static readonly GET_MEAL_PLAN = (mealPlanId: number): RcpQueryKey => {
    return ["mealPlan", { id: mealPlanId }];
  };

  public static readonly LIST_MEAL_PLANS = (filters?: ListMealPlansQuerySchema): RcpQueryKey => {
    const base: RcpQueryKey = ["listMealPlans"];

    if (filters) {
      const { page_number } = filters;
      if (page_number) {
        base.push({ page_number });
      }
    }

    return base;
  };

  public static readonly GET_MEAL_PLAN_SESSION = (mealPlanId: number): RcpQueryKey => {
    return ["mealPlanSession", { id: mealPlanId }];
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

  public static readonly LIST_MEAL_PLAN_SHARES = (filters?: Partial<ListMealPlanSharesQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listMealPlanShares"];

    const { targeting_self, from_self, page_number, user_kitchen_membership_id } = filters ?? {};
    if (targeting_self !== undefined) {
      base.push({ targeting_self });
    }
    if (from_self !== undefined) {
      base.push({ from_self });
    }
    if (page_number !== undefined) {
      base.push({ page_number });
    }
    if (user_kitchen_membership_id) {
      base.push({ user_kitchen_membership_id });
    }
    return base;
  };

  public static readonly GET_MEAL_PLAN_SHARE = (id?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["mealPlanShare"];

    if (id) {
      base.push({ id });
    }

    return base;
  };
}
