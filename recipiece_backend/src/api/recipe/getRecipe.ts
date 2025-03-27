import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaTransaction } from "@recipiece/database";
import { RecipeSchema, YRecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { s3 } from "../../util/s3";
import { getRecipeByIdQuery } from "./query";
import { Environment } from "../../util/environment";

/**
 * Get a recipe by id.
 *
 * This endpoint will return a recipe that you either own or has been shared to you.
 * If neither of those conditions are met, the endpoint will 404.
 */
export const getRecipe = async (req: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<RecipeSchema> => {
  const recipeId = +req.params.id;
  const user = req.user;
  const recipe = await getRecipeByIdQuery(tx, user, recipeId).executeTakeFirst();

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeId} not found`,
      },
    ];
  }

  const castRecipe = YRecipeSchema.cast(recipe);

  if (recipe.image_key) {
    castRecipe.image_url = `${Environment.S3_CDN_ENDPOINT}/${Environment.S3_BUCKET}/${recipe.image_key}`;
  }

  return [StatusCodes.OK, castRecipe];
};
