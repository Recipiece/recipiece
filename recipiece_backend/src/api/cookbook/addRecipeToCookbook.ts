import { PrismaTransaction } from "@recipiece/database";
import { AddRecipeToCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ConflictError } from "../../util/error";

export const addRecipeToCookbook = async (req: AuthenticatedRequest<AddRecipeToCookbookRequestSchema>, tx: PrismaTransaction): ApiResponse<{}> => {
  const attachBody = req.body;
  const user = req.user;

  const cookbook = await tx.cookbook.findFirst({
    where: {
      id: attachBody.cookbook_id,
    },
  });

  if (!cookbook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook does not exist",
      },
    ];
  }

  const recipe = await tx.recipe.findFirst({
    where: {
      id: attachBody.recipe_id,
    },
  });

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Recipe does not exist",
      },
    ];
  }

  /**
   * You cannot attach recipes to cookbooks you do not own.
   */
  if (cookbook.user_id !== user.id) {
    console.warn(`User ${user.id} attempted to attach recipe ${recipe.id} to ${cookbook.id}. They do not own the cookbook.`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook does not exist",
      },
    ];
  }

  /**
   * You cannot attach recipes you do not own to a cookbook
   */
  if (recipe.user_id !== user.id) {
    console.warn(`User ${user.id} attempted to attach recipe ${recipe.id} to ${cookbook.id}. They do not own the recipe.`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Recipe does not exist",
      },
    ];
  }

  try {
    await tx.recipeCookbookAttachment.create({
      data: {
        cookbook: {
          connect: {
            id: attachBody.cookbook_id,
          },
        },
        recipe: {
          connect: {
            id: attachBody.recipe_id,
          },
        },
      },
    });
    return [StatusCodes.CREATED, {}];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      throw new ConflictError("This recipe is already in this cookbook");
    }
    throw err;
  }
};
