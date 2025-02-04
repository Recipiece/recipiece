import { ExpressionBuilder, sql } from "kysely";
import { DB, MealPlanItem, MealPlanShare } from "../generated/kysely";

export const mealPlanSharesWithMemberships = (
  eb: ExpressionBuilder<DB, "meal_plans">,
  userId: number,
) => {
  return eb
    .selectFrom("meal_plan_shares")
    .innerJoin(
      "user_kitchen_memberships",
      "user_kitchen_memberships.id",
      "meal_plan_shares.user_kitchen_membership_id",
    )
    .whereRef("meal_plan_shares.meal_plan_id", "=", "meal_plans.id")
    .where((eb) => {
      return eb.and([
        eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
        eb.or([
          eb("user_kitchen_memberships.destination_user_id", "=", userId),
          eb("user_kitchen_memberships.source_user_id", "=", userId),
        ]),
      ]);
    });
};

export const mealPlanSharesSubquery = (
  eb: ExpressionBuilder<DB, "meal_plans">,
  userId: number,
) => {
  return mealPlanSharesWithMemberships(eb, userId).select(
    sql<MealPlanShare[]>`
      coalesce(
        jsonb_agg(meal_plan_shares.*),
        '[]'
      )
      `.as("shares_aggregate"),
  );
};

export const mealPlanItemsSubquery = (
  eb: ExpressionBuilder<DB, "meal_plans">,
) => {
  return eb
    .selectFrom("meal_plan_items")
    .whereRef("meal_plan_items.meal_plan_id", "=", "meal_plans.id")
    .select(
      sql<MealPlanItem[]>`
      coalesce(
        jsonb_agg(meal_plan_items.* order by meal_plan_items."start_date" asc),
        '[]'
      )  
      `.as("items_aggregate"),
    );
};
