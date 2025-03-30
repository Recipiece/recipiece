import { Prisma, PrismaTransaction, UserTag } from "@recipiece/database";
import { RecipeSchema, UpdateRecipeRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { lazyAttachTags } from "./query";

export const updateRecipe = async (req: AuthenticatedRequest<UpdateRecipeRequestSchema>, tx: PrismaTransaction): ApiResponse<RecipeSchema> => {
  const recipeBody = req.body;
  const user = req.user;

  const recipe = await tx.recipe.findUnique({
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
  if (recipeBody.servings) {
    recipeUpdateData.servings = recipeBody.servings;
  }
  recipeUpdateData.external_image_url = recipeBody.external_image_url;

  const updatedRecipe = await tx.recipe.update({
    data: { ...recipeUpdateData },
    where: {
      id: recipeBody.id,
    },
  });

  // handle the tags. We'll just basically obliterate any existing tags and re-attach them all
  // rather than trying to play the create-update-delete game
  await tx.recipeTagAttachment.deleteMany({
    where: {
      recipe_id: recipe.id,
    },
  });
  let tags: UserTag[] = [];
  if (recipeBody.tags && recipeBody.tags.length > 0) {
    tags = await lazyAttachTags(updatedRecipe, recipeBody.tags, tx);
  }

  return [
    StatusCodes.OK,
    {
      ...updatedRecipe,
      steps: newSteps,
      ingredients: newIngredients,
      tags: tags,
    },
  ];
};
