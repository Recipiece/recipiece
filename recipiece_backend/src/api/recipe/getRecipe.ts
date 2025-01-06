import { StatusCodes } from "http-status-codes";
import { sql } from "kysely";
import { prisma } from "../../database";
import {
  GetRecipeResponseSchema,
  RecipeIngredientSchema,
  RecipeShareSchema,
  RecipeStepSchema,
  UserKitchenMembershipSchema,
} from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

/**
 * Get a recipe by id.
 *
 * This endpoint will return a recipe that you either own or has been shared to you.
 * If neither of those conditions are met, the endpoint will 404.
 */
export const getRecipe = async (req: AuthenticatedRequest): ApiResponse<GetRecipeResponseSchema> => {
  const recipeId = +req.params.id;
  const user = req.user;

  const query = prisma.$kysely
    .with("recipe_shares_and_memberships", (db) => {
      return db
        .selectFrom("recipe_shares")
        .innerJoin(
          "user_kitchen_memberships",
          "user_kitchen_memberships.id",
          "recipe_shares.user_kitchen_membership_id"
        )
        .where((eb) => {
          return eb.and([
            eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
            eb("user_kitchen_memberships.destination_user_id", "=", user.id),
          ]);
        })
        .groupBy("recipe_shares.id")
        .selectAll("recipe_shares");
    })
    .selectFrom("recipes")
    .leftJoin("recipe_ingredients", "recipe_ingredients.recipe_id", "recipes.id")
    .leftJoin("recipe_steps", "recipe_steps.recipe_id", "recipes.id")
    .leftJoin("recipe_shares_and_memberships", "recipe_shares_and_memberships.recipe_id", "recipes.id")
    .where((eb) => {
      return eb.or([
        eb.and([eb("recipes.user_id", "=", user.id), eb("recipes.id", "=", recipeId)]),
        eb("recipe_shares_and_memberships.recipe_id", "=", recipeId),
      ]);
    })
    .selectAll("recipes")
    .select(() => {
      return [
        sql<RecipeIngredientSchema[]>`jsonb_agg(recipe_ingredients.* order by recipe_ingredients."order" asc)`.as(
          "ingredients"
        ),
      ];
    })
    .select(() => {
      return [sql<RecipeStepSchema[]>`jsonb_agg(recipe_steps.* order by recipe_steps."order" asc)`.as("steps")];
    })
    .select(() => {
      return [
        sql<
          (RecipeShareSchema & { user_kitchen_memberships: UserKitchenMembershipSchema[] })[]
        >`jsonb_agg(recipe_shares_and_memberships.*)`.as("recipe_shares"),
      ];
    })
    .groupBy("recipes.id");

  const recipe = await query.executeTakeFirst();

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, recipe];
};
