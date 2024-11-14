import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { RecipeSchema, UpdateRecipeRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateRecipe = async (req: AuthenticatedRequest<UpdateRecipeRequestSchema>): ApiResponse<RecipeSchema> => {
  const recipeBody = req.body;
  const user = req.user;

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
      const isCurrentlyPrivate = recipe.private === true;
      const willBePrivate = recipeBody.private === true;

      /**
       * If a user is making their recipe private, remove it from any cookbooks that
       * the recipe owner doesn't own
       */
      if (!isCurrentlyPrivate && willBePrivate) {
        await tx.recipeCookbookAttachment.deleteMany({
          where: {
            recipe_id: recipe.id,
            cookbook: {
              user_id: {
                not: user.id,
              },
            },
          },
        });
      }

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
