import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { AddRecipeToCookbookRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const addRecipeToCookbook = async (req: AuthenticatedRequest<AddRecipeToCookbookRequestSchema>): ApiResponse<{}> => {
  const attachBody = req.body;
  const user = req.user;

  const cookbook = await prisma.cookbook.findFirst({
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

  const recipe = await prisma.recipe.findFirst({
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
    await prisma.recipeCookbookAttachment.create({
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
      return [
        StatusCodes.CONFLICT,
        {
          message: "This recipe is already in this cookbook",
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
