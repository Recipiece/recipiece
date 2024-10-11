import { Recipe, User } from "@prisma/client";
import { Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { prisma } from "../../database";
import { StatusCodes } from "http-status-codes";

export const getRecipe = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runGetRecipe(req.user, +req.params.id);
  res.status(statusCode).send(response);
};

const runGetRecipe = async (user: User, recipeId: number): ApiResponse<Recipe> => {
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

  if (recipe.private && recipe.user_id !== user.id) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, recipe];
};
