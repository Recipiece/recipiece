import { Constant } from "@recipiece/constant";
import { KyselyCore, PrismaTransaction, Recipe } from "@recipiece/database";
import { ListRecipesQuerySchema, ListRecipesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ingredientsSubquery, recipeSharesSubquery, recipeSharesWithMemberships, stepsSubquery, tagsSubquery } from "./util";

export const listRecipes = async (request: AuthenticatedRequest<any, ListRecipesQuerySchema>, tx: PrismaTransaction): ApiResponse<ListRecipesResponseSchema> => {
  const { page_number, page_size, shared_recipes, search, cookbook_id, cookbook_attachments, ingredients, tags } = request.query;
  const actualPageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;
  const user = request.user;

  const recipesCte = (db: Parameters<Parameters<typeof tx.$kysely.with>[1]>[0]) => {
    return db
      .selectFrom("recipes")
      .selectAll("recipes")
      .select((eb) => {
        const base: any[] = [stepsSubquery(eb).as("steps"), ingredientsSubquery(eb).as("ingredients"), recipeSharesSubquery(eb, user.id).as("shares"), tagsSubquery(eb).as("tags")];

        if (ingredients) {
          base.push(
            eb
              .selectFrom("recipe_ingredients")
              .select("recipe_ingredients.id")
              .whereRef("recipe_ingredients.recipe_id", "=", "recipes.id")
              .where(() => {
                const joined = KyselyCore.sql.raw(ingredients.join("|"));
                return KyselyCore.sql`lower(recipe_ingredients.name) ~* '(${joined})'`;
              })
              .limit(1)
              .as("test_ingredient")
          );
        }

        if (tags) {
          base.push(
            eb
              .selectFrom("user_tags")
              .select("user_tags.id")
              .innerJoin("recipe_tag_attachments", "recipe_tag_attachments.user_tag_id", "user_tags.id")
              .whereRef("recipe_tag_attachments.recipe_id", "=", "recipes.id")
              .where(() => {
                const joined = KyselyCore.sql.raw(tags.join("|"));
                return KyselyCore.sql`lower(user_tags.content) ~* '(${joined})'`;
              })
              .limit(1)
              .as("test_tag")
          );
        }

        return base;
      })
      .where((eb) => {
        if (shared_recipes === "include") {
          return eb.or([eb("recipes.user_id", "=", user.id), eb.exists(recipeSharesWithMemberships(eb, user.id).select("recipe_shares.id").limit(1))]);
        } else {
          return eb("recipes.user_id", "=", user.id);
        }
      });
  };

  let query = tx.$kysely.with("expanded_recipes", recipesCte).selectFrom("expanded_recipes").selectAll();

  if (search) {
    query = query.where("expanded_recipes.name", "ilike", `%${search}%`);
  }

  if (cookbook_id && cookbook_attachments === "include") {
    query = query
      .innerJoin("recipe_cookbook_attachments", "recipe_cookbook_attachments.recipe_id", "expanded_recipes.id")
      .where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id);
  } else if (cookbook_id && cookbook_attachments === "exclude") {
    query = query.where((eb) => {
      return eb(
        "expanded_recipes.id",
        "not in",
        eb.selectFrom("recipe_cookbook_attachments").select("recipe_cookbook_attachments.recipe_id").where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id)
      );
    });
  }

  if (ingredients) {
    query = query.where("expanded_recipes.test_ingredient", "is not", null);
  }

  if (tags) {
    query = query.where("expanded_recipes.test_tag", "is not", null);
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
