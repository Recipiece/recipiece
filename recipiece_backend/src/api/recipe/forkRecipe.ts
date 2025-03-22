import { PrismaTransaction } from "@recipiece/database";
import { ForkRecipeRequestSchema, RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { getRecipeByIdQuery } from "./query";

export const forkRecipe = async (
  request: AuthenticatedRequest<ForkRecipeRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<RecipeSchema> => {
  const { original_recipe_id } = request.body;
  const user = request.user;
  const originalRecipe = await getRecipeByIdQuery(tx, user, original_recipe_id).executeTakeFirst();

  if (!originalRecipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${original_recipe_id} not found.`,
      },
    ];
  }

  if (originalRecipe.user_id === user.id) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Cannot fork your own recipe",
      },
    ];
  }

  const { id, user_id, created_at, ingredients, metadata, steps, tags, user_kitchen_membership_id, ...restRecipe } =
    originalRecipe;
  const metadataCast = metadata as any;
  const idLessIngredients = (ingredients ?? []).map((ing) => {
    const { id, recipe_id, ...restIng } = ing;
    return restIng;
  });
  const idLessSteps = (steps ?? []).map((step) => {
    const { id, recipe_id, ...restStep } = step;
    return restStep;
  });

  const forkedRecipe = await tx.recipe.create({
    data: {
      ...restRecipe,
      user_id: user.id,
      metadata: {
        ...metadataCast,
        forks: [
          ...(metadataCast?.forks || []),
          {
            forked_on: DateTime.utc().toISO(),
            forked_from_recipe: originalRecipe.id,
            forked_from_user: originalRecipe.user_id,
            forked_by: user.id,
          },
        ],
      },
      ingredients: {
        createMany: {
          data: [...idLessIngredients],
        },
      },
      steps: {
        createMany: {
          data: [...idLessSteps],
        },
      },
    },
    include: {
      steps: true,
      ingredients: true,
    },
  });

  return [StatusCodes.CREATED, forkedRecipe];
};
