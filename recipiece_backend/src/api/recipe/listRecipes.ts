import { StatusCodes } from "http-status-codes";
import { prisma, Recipe, ingredientsSubquery, recipeSharesSubquery, recipeSharesWithMemberships, stepsSubquery } from "@recipiece/database";
import { ListRecipesQuerySchema, ListRecipesResponseSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";

export const listRecipes = async (request: AuthenticatedRequest<any, ListRecipesQuerySchema>): ApiResponse<ListRecipesResponseSchema> => {
  const { page_number, page_size, shared_recipes, search, cookbook_id, cookbook_attachments } = request.query;
  const actualPageSize = page_size ?? DEFAULT_PAGE_SIZE;
  const user = request.user;

  let query = prisma.$kysely
    .selectFrom("recipes")
    .selectAll("recipes")
    .select((eb) => {
      return [stepsSubquery(eb).as("steps"), ingredientsSubquery(eb).as("ingredients"), recipeSharesSubquery(eb, user.id).as("shares")];
    })
    .where((eb) => {
      if (shared_recipes === "include") {
        return eb.or([eb("recipes.user_id", "=", user.id), eb.exists(recipeSharesWithMemberships(eb, user.id).select("recipe_shares.id").limit(1))]);
      } else {
        return eb("recipes.user_id", "=", user.id);
      }
    });

  if (search) {
    query = query.where("recipes.name", "ilike", `%${search}%`);
  }

  if (cookbook_id && cookbook_attachments === "include") {
    query = query
      .innerJoin("recipe_cookbook_attachments", "recipe_cookbook_attachments.recipe_id", "recipes.id")
      .where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id);
  } else if (cookbook_id && cookbook_attachments === "exclude") {
    query = query.where((eb) => {
      return eb(
        "recipes.id",
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
