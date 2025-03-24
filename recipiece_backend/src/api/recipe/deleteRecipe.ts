import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteRecipe = async (req: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{ readonly deleted: boolean }> => {
  const recipeId = +req.params.id;
  const user = req.user;

  const recipe = await tx.recipe.findUnique({
    where: {
      id: recipeId,
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

  if (recipe.user_id !== user.id) {
    console.log(`user ${user.id} attempted to delete a recipe belonging to ${recipe.user_id}`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeId} not found`,
      },
    ];
  }

  await tx.recipe.delete({
    where: {
      id: recipeId,
    },
  });
  return [StatusCodes.OK, { deleted: true }];
};
