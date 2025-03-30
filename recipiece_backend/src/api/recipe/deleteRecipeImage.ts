import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { Environment } from "../../util/environment";
import { s3 } from "../../util/s3";

/**
 * Allow the user to explicitly unset an image on a recipe.
 */
export const deleteRecipeImage = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const recipeId = +request.params.id;
  const user = request.user;

  const recipe = await tx.recipe.findFirst({
    where: {
      id: recipeId,
      user_id: user.id,
    },
  });

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeId} not found`,
      },
    ];
  }

  const imageKey = recipe.image_key;
  if (imageKey) {
    // delete the object and clear the image key
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: Environment.S3_BUCKET,
      Key: imageKey,
    });
    await s3.send(deleteObjectCommand);

    await tx.recipe.update({
      where: { id: recipe.id },
      data: { image_key: null },
    });
  } else {
    console.log(`no image key set for recipe ${recipeId}`);
  }

  return [StatusCodes.OK, {}];
};
