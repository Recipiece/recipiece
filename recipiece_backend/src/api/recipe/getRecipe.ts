import { ingredientsSubquery, prisma, recipeSharesSubquery, recipeSharesWithMemberships, stepsSubquery } from "@recipiece/database";
import { RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

/**
 * Get a recipe by id.
 *
 * This endpoint will return a recipe that you either own or has been shared to you.
 * If neither of those conditions are met, the endpoint will 404.
 */
export const getRecipe = async (req: AuthenticatedRequest): ApiResponse<RecipeSchema> => {
  const recipeId = +req.params.id;
  const user = req.user;

  const query = prisma.$kysely
    .selectFrom("recipes")
    .selectAll("recipes")
    .select((eb) => {
      return [stepsSubquery(eb).as("steps"), ingredientsSubquery(eb).as("ingredients"), recipeSharesSubquery(eb, user.id).as("shares")];
    })
    .where((eb) => {
      return eb.and([
        eb("recipes.id", "=", recipeId),
        eb.or([eb("recipes.user_id", "=", user.id), eb.exists(recipeSharesWithMemberships(eb, user.id).select("recipe_shares.id").limit(1))]),
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
