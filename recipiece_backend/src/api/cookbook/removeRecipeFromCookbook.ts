import { User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { RemoveRecipeFromCookbookSchema, YRemoveRecipeFromCookbookSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const removeRecipeFromCookbook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runRemoveRecipeFromCookbook(req.user, req.body);
  res.status(statusCode).send(response);
};

const runRemoveRecipeFromCookbook = async (user: User, body: any): ApiResponse<{}> => {
  let removeBody: RemoveRecipeFromCookbookSchema;
  try {
    removeBody = await YRemoveRecipeFromCookbookSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to remove a recipe from a cookbook",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

  const cookbook = await prisma.cookbook.findFirst({
    where: {
      id: removeBody.cookbook_id,
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

  /**
   * You cannot remove recipes from cookbooks you do not own
   */
  if (cookbook.user_id !== user.id) {
    console.warn(`User ${user.id} attempted to remove recipe ${removeBody.recipe_id} from cookbook ${cookbook.id}. They do not own the cookbook.`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook does not exist",
      },
    ];
  }

  try {
    await prisma.recipeCookbookAttachment.delete({
      where: {
        id: {
          recipe_id: removeBody.recipe_id,
          cookbook_id: removeBody.cookbook_id,
        },
      },
    });

    return [StatusCodes.OK, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to create recipe",
      },
    ];
  }
};
