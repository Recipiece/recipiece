import { Recipe, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { sql } from "kysely";
import { prisma } from "../../database";
import { ListRecipesQuerySchema, ListRecipesResponseSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";

export const listRecipes = async (
  request: AuthenticatedRequest<any, ListRecipesQuerySchema>
): ApiResponse<ListRecipesResponseSchema> => {
  const { page_number, page_size, search, cookbook_id, cookbook_attachments, shared_recipes } = request.query;
  const actualPageSize = page_size ?? DEFAULT_PAGE_SIZE;

  let query = generateOwnedRecipesQuery(request.user, request.query);

  if (shared_recipes === "include") {
    const sharedQuery = generateSharedRecipesQuery(request.user, request.query);
    query = query.unionAll(sharedQuery);
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

const generateOwnedRecipesQuery = (user: User, filters: ListRecipesQuerySchema) => {
  const { search, cookbook_id, cookbook_attachments } = filters;

  let query = prisma.$kysely
    .selectFrom("recipes")
    .leftJoin("recipe_ingredients", "recipes.id", "recipe_ingredients.recipe_id")
    .leftJoin("recipe_steps", "recipes.id", "recipe_steps.recipe_id")
    .where("recipes.user_id", "=", user.id);

  if (search) {
    query = query.where("recipes.name", "ilike", `%${search}%`);
  }

  if (cookbook_id && cookbook_attachments === "include") {
    query = query
      .innerJoin("recipe_cookbook_attachments", "recipe_cookbook_attachments.recipe_id", "recipes.id")
      .where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id);
  } else if (cookbook_id && cookbook_attachments === "exclude") {
    query = query
      .leftJoin("recipe_cookbook_attachments", "recipe_cookbook_attachments.recipe_id", "recipes.id")
      .where((eb) => {
        return eb
          .case()
          .when("recipe_cookbook_attachments.recipe_id", "is not", null)
          .then(eb("recipe_cookbook_attachments.cookbook_id", "!=", cookbook_id))
          .else(true)
          .end();
      });
  }

  query = query
    .selectAll("recipes")
    .select(() => {
      return [sql<string>`jsonb_agg(recipe_ingredients.* order by recipe_ingredients."order" asc)`.as("ingredients")];
    })
    .select(() => {
      return [sql<string>`jsonb_agg(recipe_steps.* order by recipe_steps."order" asc)`.as("steps")];
    });

  query = query.groupBy("recipes.id");

  return query;
};

const generateSharedRecipesQuery = (user: User, filters: ListRecipesQuerySchema) => {
  const { search } = filters;

  let query = prisma.$kysely
    .selectFrom("user_kitchen_memberships")
    .innerJoin("recipe_shares", "recipe_shares.user_kitchen_membership_id", "user_kitchen_memberships.id")
    .innerJoin("recipes", "recipe_shares.recipe_id", "recipes.id")
    .leftJoin("recipe_ingredients", "recipes.id", "recipe_ingredients.recipe_id")
    .leftJoin("recipe_steps", "recipes.id", "recipe_steps.recipe_id")
    .where((eb) => {
      return eb.and([
        eb("user_kitchen_memberships.destination_user_id", "=", user.id),
        eb("user_kitchen_memberships.status", "=", "accepted"),
      ]);
    });

  if (search) {
    query = query.where("recipes.name", "ilike", `%${search}%`);
  }

  query = query
    .selectAll("recipes")
    .select(() => {
      return [sql<string>`jsonb_agg(recipe_ingredients.* order by recipe_ingredients."order" asc)`.as("ingredients")];
    })
    .select(() => {
      return [sql<string>`jsonb_agg(recipe_steps.* order by recipe_steps."order" asc)`.as("steps")];
    });

  query = query.groupBy("recipes.id");

  return query;
};
