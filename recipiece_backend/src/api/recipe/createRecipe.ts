import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CreateRecipeRequestSchema, RecipeSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createRecipe = async (req: AuthenticatedRequest<CreateRecipeRequestSchema>): ApiResponse<RecipeSchema> => {
  const recipeBody = req.body;
  const user = req.user;

  try {
    const createInput: Prisma.RecipeCreateInput = {
      name: recipeBody.name,
      description: recipeBody.description,
      servings: recipeBody.servings,
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
    if ((err as { code: string })?.code === "P2002") {
      return [
        StatusCodes.CONFLICT,
        {
          message: "You already have a recipe with this name",
        },
      ];
    } else {
      console.error(err);
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to create recipe",
        },
      ];
    }
  }
};
