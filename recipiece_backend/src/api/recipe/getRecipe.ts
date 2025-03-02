import { KyselyCore, KyselyGenerated, PrismaTransaction } from "@recipiece/database";
import { RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ingredientsSubquery, recipeSharesSubquery, recipeSharesWithMemberships, stepsSubquery, tagsSubquery } from "./util";

/**
 * Get a recipe by id.
 *
 * This endpoint will return a recipe that you either own or has been shared to you.
 * If neither of those conditions are met, the endpoint will 404.
 */
export const getRecipe = async (req: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<RecipeSchema> => {
  const recipeId = +req.params.id;
  const user = req.user;

  const selectiveShareCheck = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
    return eb.exists(
      eb
        .selectFrom("recipe_shares")
        .select("recipe_shares.id")
        .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "recipe_shares.user_kitchen_membership_id")
        .where((_eb) => {
          return _eb.and([
            _eb("user_kitchen_memberships.destination_user_id", "=", user.id),
            _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
            _eb(_eb.cast("user_kitchen_memberships.grant_level", "text"), "=", "SELECTIVE"),
          ]);
        })
        .whereRef("recipe_shares.recipe_id", "=", "recipes.id")
        .whereRef("user_kitchen_memberships.source_user_id", "=", "recipes.user_id")
        .limit(1)
    );
  };

  const allShareCheck = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
    return eb.exists(
      eb
        .selectFrom("user_kitchen_memberships")
        .where((_eb) => {
          return _eb.and([
            _eb("user_kitchen_memberships.destination_user_id", "=", user.id),
            _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
            _eb(_eb.cast("user_kitchen_memberships.grant_level", "text"), "=", "ALL"),
          ]);
        })
        .whereRef("user_kitchen_memberships.source_user_id", "=", "recipes.user_id")
        .where("recipes.id", "=", recipeId)
        .limit(1)
    );
  };

  const query = tx.$kysely
    .selectFrom("recipes")
    .selectAll("recipes")
    .select((eb) => {
      return [stepsSubquery(eb).as("steps"), ingredientsSubquery(eb).as("ingredients"), tagsSubquery(eb).as("tags")];
    })
    .select((eb) => {
      return eb
        .case()
        .when("recipes.user_id", "=", user.id)
        .then(recipeSharesSubquery(eb, user.id))
        .when(selectiveShareCheck(eb))
        .then(recipeSharesSubquery(eb, user.id))
        .when(allShareCheck(eb))
        .then(
          eb.fn("jsonb_build_array", [
            eb.fn("jsonb_build_object", [
              KyselyCore.sql.lit("id"),
              eb.lit(-1),
              KyselyCore.sql.lit("created_at"),
              eb.fn("now"),
              KyselyCore.sql.lit("recipe_id"),
              "recipes.id",
              KyselyCore.sql.lit("user_kitchen_membership_id"),
              eb
                .selectFrom("user_kitchen_memberships")
                .select("user_kitchen_memberships.id")
                .whereRef("user_kitchen_memberships.source_user_id", "=", "recipes.user_id")
                .where((_eb) => {
                  return _eb.and([
                    _eb("user_kitchen_memberships.destination_user_id", "=", user.id),
                    _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
                    _eb(_eb.cast("user_kitchen_memberships.grant_level", "text"), "=", "ALL"),
                  ]);
                })
                .limit(1),
            ]),
          ])
        )
        .else(KyselyCore.sql`'[]'::jsonb`)
        .end()
        .as("shares");
    })
    .where((eb) => {
      return eb.and([
        eb("recipes.id", "=", recipeId),
        eb.or([
          // it's your recipe
          eb("recipes.user_id", "=", user.id),
          // it's been explicitly shared through a SELECTIVE grant type
          selectiveShareCheck(eb),
          // it's implicitly shared through an ALL grant type
          allShareCheck(eb),
        ]),
      ]);
    });

  const recipe = await query.executeTakeFirst();

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, recipe as RecipeSchema];
};
