import { User } from "@prisma/client";
import { Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { prisma } from "../../database";
import { StatusCodes } from "http-status-codes";

export const deleteRecipe = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runDeleteRecipe(req.user, +req.params.id);
  res.status(statusCode).send(response);
};

const runDeleteRecipe = async (user: User, recipeId: number): ApiResponse<{ readonly deleted: boolean }> => {
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
    return [
      StatusCodes.UNAUTHORIZED,
      {
        message: "Cannot delete a recipe you do not own",
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
