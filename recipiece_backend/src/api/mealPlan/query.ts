import { KyselyCore, KyselyGenerated, PrismaTransaction, User } from "@recipiece/database";

export const getMealPlanByIdQuery = (tx: PrismaTransaction, user: User, mealPlanId: number) => {
  const selectiveShareCheck = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "meal_plans">) => {
    return eb.exists(
      eb
        .selectFrom("meal_plan_shares")
        .select("meal_plan_shares.id")
        .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "meal_plan_shares.user_kitchen_membership_id")
        .where((_eb) => {
          return _eb.and([
            _eb("user_kitchen_memberships.destination_user_id", "=", user.id),
            _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
          ]);
        })
        .whereRef("meal_plan_shares.meal_plan_id", "=", "meal_plans.id")
        .whereRef("user_kitchen_memberships.source_user_id", "=", "meal_plans.user_id")
        .limit(1)
    );
  };

  const query = tx.$kysely
    .selectFrom("meal_plans")
    .selectAll("meal_plans")
    .select((eb) => {
      return eb
        .case()
        .when("meal_plans.user_id", "=", user.id)
        .then(mealPlanSharesSubquery(eb, user.id))
        .when(selectiveShareCheck(eb))
        .then(mealPlanSharesSubquery(eb, user.id))
        .else(KyselyCore.sql`'[]'::jsonb`)
        .end()
        .as("shares");
    })
    .where((eb) => {
      return eb.and([
        eb("meal_plans.id", "=", mealPlanId),
        eb.or([
          eb("meal_plans.user_id", "=", user.id),
          selectiveShareCheck(eb),
        ]),
      ]);
    });

  return query;
};

export const mealPlanSharesWithMemberships = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "meal_plans">, userId: number) => {
  return eb
    .selectFrom("meal_plan_shares")
    .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "meal_plan_shares.user_kitchen_membership_id")
    .whereRef("meal_plan_shares.meal_plan_id", "=", "meal_plans.id")
    .where((eb) => {
      return eb.and([
        eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
        eb.or([eb("user_kitchen_memberships.destination_user_id", "=", userId), eb("user_kitchen_memberships.source_user_id", "=", userId)]),
      ]);
    });
};

export const mealPlanSharesSubquery = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "meal_plans">, userId: number) => {
  return mealPlanSharesWithMemberships(eb, userId).select(
    KyselyCore.sql<KyselyGenerated.MealPlanShare[]>`
      coalesce(
        jsonb_agg(meal_plan_shares.*),
        '[]'
      )
      `.as("shares_aggregate")
  );
};

export const mealPlanItemsSubquery = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "meal_plans">) => {
  return eb
    .selectFrom("meal_plan_items")
    .whereRef("meal_plan_items.meal_plan_id", "=", "meal_plans.id")
    .select(
      KyselyCore.sql<KyselyGenerated.MealPlanItem[]>`
      coalesce(
        jsonb_agg(meal_plan_items.* order by meal_plan_items."start_date" asc),
        '[]'
      )  
      `.as("items_aggregate")
    );
};
