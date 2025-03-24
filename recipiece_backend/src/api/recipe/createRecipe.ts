import { Prisma, PrismaTransaction, UserTag } from "@recipiece/database";
import { CreateRecipeRequestSchema, RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ConflictError } from "../../util/error";
import { lazyAttachTags } from "./query";

export const createRecipe = async (req: AuthenticatedRequest<CreateRecipeRequestSchema>, tx: PrismaTransaction): ApiResponse<RecipeSchema> => {
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

    return [StatusCodes.OK, { ...createdRecipe, tags: [...tags] }];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      throw new ConflictError("You already have a recipe with this name");
    }
    throw err;
  }
};
