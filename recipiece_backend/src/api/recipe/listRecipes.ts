import { Constant } from "@recipiece/constant";
import { KyselyCore, KyselyGenerated, PrismaTransaction, Recipe } from "@recipiece/database";
import { ListRecipesQuerySchema, ListRecipesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ingredientsSubquery, recipeSharesSubquery, stepsSubquery, tagsSubquery } from "./query";

export const listRecipes = async (request: AuthenticatedRequest<any, ListRecipesQuerySchema>, tx: PrismaTransaction): ApiResponse<ListRecipesResponseSchema> => {
  const { page_number, page_size, shared_recipes, search, cookbook_id, cookbook_attachments, ingredients, tags, ingredients_filter, tags_filter } = request.query;
  const actualPageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;
  const user = request.user;

  const selectableSubqueries = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
    return [ingredientsSubquery(eb).as("ingredients"), stepsSubquery(eb).as("steps"), tagsSubquery(eb).as("tags")];
  };

  let query = tx.$kysely
    .with("owned_recipes", (db) => {
      return db
        .selectFrom("recipes")
        .selectAll("recipes")
        .select(selectableSubqueries)
        .select((eb) => recipeSharesSubquery(eb, user.id).as("shares"))
        .where("recipes.user_id", "=", user.id);
    })
    .with("selective_grant_shared_recipes", (db) => {
      return (
        db
          .selectFrom("recipe_shares")
          .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "recipe_shares.user_kitchen_membership_id")
          .innerJoin("recipes", "recipes.id", "recipe_shares.recipe_id")
          .where((eb) => {
            return eb.and([
              eb("user_kitchen_memberships.destination_user_id", "=", user.id),
              eb(eb.cast("user_kitchen_memberships.grant_level", "text"), "=", "SELECTIVE"),
              eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
            ]);
          })
          .selectAll("recipes")
          .select(selectableSubqueries)
          // these shares are "normal" because they are explicitly shared
          .select((eb) => recipeSharesSubquery(eb, user.id).as("shares"))
      );
    })
    .with("all_grant_shared_recipes", (db) => {
      return (
        db
          .selectFrom("user_kitchen_memberships")
          .innerJoin("users", "users.id", "user_kitchen_memberships.source_user_id")
          .innerJoin("recipes", "recipes.user_id", "user_id")
          .where((eb) => {
            return eb.and([
              eb("user_kitchen_memberships.destination_user_id", "=", user.id),
              eb(eb.cast("user_kitchen_memberships.grant_level", "text"), "=", "ALL"),
              eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
            ]);
          })
          .whereRef("user_kitchen_memberships.source_user_id", "=", "recipes.user_id")
          .selectAll("recipes")
          .select(selectableSubqueries)
          // these shares are synthetic because we don't explicitly create shares for "ALL" records
          .select((eb) => {
            return eb
              .fn("jsonb_build_array", [
                eb.fn("jsonb_build_object", [
                  KyselyCore.sql.lit("id"),
                  eb.lit(-1),
                  KyselyCore.sql.lit("created_at"),
                  eb.fn("now"),
                  KyselyCore.sql.lit("recipe_id"),
                  "recipes.id",
                  KyselyCore.sql.lit("user_kitchen_membership_id"),
                  "user_kitchen_memberships.id",
                ]),
              ])
              .as("shares");
          })
      );
    })
    .with("all_recipes", (db) => {
      if (shared_recipes === "include") {
        return db
          .selectFrom("owned_recipes")
          .union((eb) => {
            return eb.selectFrom("selective_grant_shared_recipes").selectAll();
          })
          .union((eb) => {
            return eb.selectFrom("all_grant_shared_recipes").selectAll();
          })
          .selectAll();
      } else {
        return db.selectFrom("owned_recipes").selectAll();
      }
    })
    .selectFrom("all_recipes")
    .selectAll("all_recipes");

  if (ingredients) {
    if (ingredients_filter === "include") {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(ingredients.join("|"));
        return KyselyCore.sql`lower(all_recipes.ingredients::text) ~* '"name": "(${joined})"'`;
      });
    } else {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(ingredients.join("|"));
        return KyselyCore.sql`lower(all_recipes.ingredients::text) !~* '"name": "(${joined})"'`;
      });
    }
  }

  if (tags) {
    if (tags_filter === "include") {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(tags.join("|"));
        return KyselyCore.sql`lower(all_recipes.tags::text) ~* '"content": "(${joined})"'`;
      });
    } else {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(tags.join("|"));
        return KyselyCore.sql`lower(all_recipes.tags::text) !~* '"content": "(${joined})"'`;
      });
    }
  }

  if (search) {
    query = query.where("all_recipes.name", "ilike", `%${search}%`);
  }

  if (cookbook_id && cookbook_attachments === "include") {
    query = query
      .innerJoin("recipe_cookbook_attachments", "recipe_cookbook_attachments.recipe_id", "all_recipes.id")
      .where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id);
  } else if (cookbook_id && cookbook_attachments === "exclude") {
    query = query.where((eb) => {
      return eb(
        "all_recipes.id",
        "not in",
        eb.selectFrom("recipe_cookbook_attachments").select("recipe_cookbook_attachments.recipe_id").where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id)
      );
    });
  }

  query = query.offset(page_number * actualPageSize).limit(actualPageSize + 1);

  const recipes = await query.execute();

  const hasNextPage = recipes.length > actualPageSize;
  const resultsData = recipes.splice(0, actualPageSize) as Recipe[];

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
