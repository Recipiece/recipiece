import { Prisma, Recipe, RecipeIngredient, RecipeStep, User } from "@prisma/client";
import { Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { prisma } from "../../database";
import { StatusCodes } from "http-status-codes";
import { RecipeSchema, UpdateRecipeSchema, YUpdateRecipeSchema } from "../../schema";

type UpdateRecipeBody = Omit<Recipe, "created_at" | "user_id"> & {
  readonly ingredients: Omit<RecipeIngredient, "id">[];
  readonly steps: Omit<RecipeStep, "id">[];
};

export const updateRecipe = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runUpdateRecipe(req.user, req.body as UpdateRecipeBody);
  res.status(statusCode).send(response);
};

const runUpdateRecipe = async (user: User, body: any): ApiResponse<RecipeSchema> => {
  let recipeBody: UpdateRecipeSchema;
  try {
    recipeBody = await YUpdateRecipeSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to update a recipe",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

  const recipe = await prisma.recipe.findUnique({
    where: {
      id: recipeBody.id,
    },
    include: {
      steps: true,
      ingredients: true,
    },
  });

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeBody.id} not found`,
      },
    ];
  }

  if (recipe.user_id !== user.id) {
    console.log(`user ${user.id} attempted to update recipe ${recipe.id}`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipeBody.id} not found`,
      },
    ];
  }

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({
        where: {
          recipe_id: recipeBody.id,
        },
      });

      await tx.recipeStep.deleteMany({
        where: {
          recipe_id: recipeBody.id,
        },
      });

      const newIngredients = await tx.recipeIngredient.createManyAndReturn({
        data: (recipeBody.ingredients || []).map((ing) => {
          return {
            ...ing,
            recipe_id: recipeBody.id,
          };
        }),
      });

      const newSteps = await tx.recipeStep.createManyAndReturn({
        data: (recipeBody.steps || []).map((step) => {
          return {
            ...step,
            recipe_id: recipeBody.id,
          };
        }),
      });

      const recipeUpdateData: Prisma.RecipeUpdateInput = {};
      if (recipeBody.name) {
        recipeUpdateData.name = recipeBody.name;
      }
      if (recipeBody.description) {
        recipeUpdateData.description = recipeBody.description;
      }
      if (recipeBody.private) {
        recipeUpdateData.private = recipeBody.private;
      }

      const updatedRecipe = await tx.recipe.update({
        data: { ...recipeUpdateData },
        where: {
          id: recipeBody.id,
        },
      });

      return {
        ...updatedRecipe,
        steps: newSteps,
        ingredients: newIngredients,
      };
    });
    return [StatusCodes.OK, { ...transaction }];
  } catch (error) {
    console.error(error);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to update recipe",
      },
    ];
  }
};
