import { ExpressionBuilder, sql } from "kysely";
import { DB, RecipeIngredient, RecipeShare, RecipeStep } from "../generated/kysely";

export const ingredientsSubquery = (eb: ExpressionBuilder<DB, "recipes">) => {
  return eb
    .selectFrom("recipe_ingredients")
    .whereRef("recipe_ingredients.recipe_id", "=", "recipes.id")
    .select(
      sql<RecipeIngredient[]>`
      coalesce(
        jsonb_agg(recipe_ingredients.* order by recipe_ingredients."order" asc),
        '[]'
      )  
      `.as("ingredient_aggregate")
    );
};

export const recipeSharesWithMemberships = (eb: ExpressionBuilder<DB, "recipes">, userId: number) => {
  return eb
    .selectFrom("recipe_shares")
    .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "recipe_shares.user_kitchen_membership_id")
    .whereRef("recipe_shares.recipe_id", "=", "recipes.id")
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

export const recipeSharesSubquery = (eb: ExpressionBuilder<DB, "recipes">, userId: number) => {
  return recipeSharesWithMemberships(eb, userId).select(
    sql<RecipeShare[]>`
      coalesce(
        jsonb_agg(recipe_shares.*),
        '[]'
      )
      `.as("shares_aggregate")
  );
};

export const stepsSubquery = (eb: ExpressionBuilder<DB, "recipes">) => {
  return eb
    .selectFrom("recipe_steps")
    .select(
      sql<RecipeStep[]>`
      coalesce(
        jsonb_agg(recipe_steps.* order by recipe_steps."order" asc),
        '[]'
      )  
      `.as("steps_aggregate")
    )
    .whereRef("recipe_steps.recipe_id", "=", "recipes.id");
};