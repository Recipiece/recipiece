import { Prisma, Recipe, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CreateRecipeSchema, RecipeSchema, YCreateRecipeSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createRecipe = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runCreateRecipe(req.user, req.body);
  res.status(statusCode).send(response);
};

const runCreateRecipe = async (user: User, body: any): ApiResponse<RecipeSchema> => {
  let recipeBody: CreateRecipeSchema;
  try {
    recipeBody = await YCreateRecipeSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to create a recipe",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

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
          data: [...(recipeBody.ingredients || [])],
        },
      },
      steps: {
        createMany: {
          data: [...(recipeBody.steps || [])],
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

    if ((err as { code: string })?.code === "P2002") {
      return [
        StatusCodes.CONFLICT,
        {
          message: "You already have a recipe with this name",
        },
      ];
    } else {
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to create recipe",
        },
      ];
    }
  }
};
