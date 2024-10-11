import { Prisma, Recipe, RecipeIngredient, RecipeStep, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

type CreateRecipeBody = Omit<Recipe, "id" | "created_at" | "user_id"> & {
  readonly ingredients: Omit<RecipeIngredient, "id" | "recipe_id">[];
  readonly steps: Omit<RecipeStep, "id" | "recipe_id">[];
};

export const createRecipe = async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as CreateRecipeBody;
  const [statusCode, response] = await runCreateRecipe(req.user, body);
  res.status(statusCode).send(response);
};

const runCreateRecipe = async (user: User, recipeBody: CreateRecipeBody): ApiResponse<Recipe> => {
  try {
    const createInput: Prisma.RecipeCreateInput = {
      name: recipeBody.name,
      description: recipeBody.description,
      user: {
        connect: {
          id: user.id,
        },
      },
      ingredients: {
        createMany: {
          data: [...recipeBody.ingredients],
        },
      },
      steps: {
        createMany: {
          data: [...recipeBody.steps],
        },
      },
    };

    const recipe = await prisma.recipe.create({
      data: {
        ...createInput,
      },
      include: {
        ingredients: true,
        steps: true,
      },
    });
    return [StatusCodes.OK, recipe];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to create recipe",
      },
    ];
  }
};
