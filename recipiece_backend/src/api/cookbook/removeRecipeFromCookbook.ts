import { Prisma, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import {
  AddRecipeToCookBookSchema,
  CreateCookBookSchema,
  RecipeSchema,
  RemoveRecipeFromCookBookSchema,
  YAddRecipeToCookBookSchema,
  YCreateCookBookSchema,
  YRemoveRecipeFromCookBookSchema,
} from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const removeRecipeFromCookBook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runRemoveRecipeFromCookBook(req.user, req.body);
  res.status(statusCode).send(response);
};

const runRemoveRecipeFromCookBook = async (user: User, body: any): ApiResponse<{}> => {
  let removeBody: RemoveRecipeFromCookBookSchema;
  try {
    removeBody = await YRemoveRecipeFromCookBookSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to remove a recipe from a cookbook",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

  const cookBook = await prisma.cookBook.findFirst({
    where: {
      id: removeBody.cookbook_id,
    },
  });

  if (!cookBook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "CookBook does not exist",
      },
    ];
  }

  /**
   * You cannot remove recipes from cookbooks you do not own
   */
  if (cookBook.user_id !== user.id) {
    console.warn(`User ${user.id} attempted to remove recipe ${removeBody.recipe_id} from cookbook ${cookBook.id}. They do not own the cookbook.`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "CookBook does not exist",
      },
    ];
  }

  try {
    await prisma.recipeCookBookAttachment.delete({
      where: {
        id: {
          recipe_id: removeBody.recipe_id,
          cookbook_id: removeBody.cookbook_id,
        }
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
