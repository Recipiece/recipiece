import { Recipe } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getRecipe = async (req: AuthenticatedRequest): ApiResponse<Recipe> => {
  const recipeId = +req.params.id;
  const user = req.user;

  const recipe = await prisma.recipe.findUnique({
    where: {
      id: recipeId,
    },
    include: {
      steps: {
        orderBy: {
          order: "asc",
        },
      },
      ingredients: {
        orderBy: {
          order: "asc",
        },
      },
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

  /**
   * You cannot get a recipe you do not own
   */
  if (recipe.user_id !== user.id) {
    console.log(`user ${user.id} attempted to access recipe ${recipe.id} owned by user ${recipe.user_id}`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, recipe];
};
