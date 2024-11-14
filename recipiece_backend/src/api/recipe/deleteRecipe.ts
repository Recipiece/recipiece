import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteRecipe = async (req: AuthenticatedRequest): ApiResponse<{ readonly deleted: boolean }> => {
  const recipeId = +req.params.id;
  const user = req.user;

  const recipe = await prisma.recipe.findUnique({
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

  try {
    await prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });
    return [StatusCodes.OK, { deleted: true }];
  } catch (error) {
    console.error(error);
    return [StatusCodes.BAD_REQUEST, { deleted: false }];
  }
};
