import { StatusCodes } from "http-status-codes";
import { Prisma, prisma, UserTag } from "@recipiece/database";
import { CreateRecipeRequestSchema, RecipeSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { lazyAttachTags } from "./util";

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

    const recipe = await prisma.$transaction(async (tx) => {
      const createdRecipe = await tx.recipe.create({
        data: {
          ...createInput,
        },
        include: {
          ingredients: true,
          steps: true,
        },
      });

      let tags: UserTag[] = [];
      if (recipeBody.tags && recipeBody.tags.length > 0) {
        tags = await lazyAttachTags(createdRecipe, recipeBody.tags, tx);
      }

      return { ...createdRecipe, tags: [...tags] };
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
