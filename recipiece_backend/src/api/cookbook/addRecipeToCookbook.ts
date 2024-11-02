import { Prisma, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { AddRecipeToCookBookSchema, CreateCookBookSchema, RecipeSchema, YAddRecipeToCookBookSchema, YCreateCookBookSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const addRecipeToCookBook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runAddRecipeToCookBook(req.user, req.body);
  res.status(statusCode).send(response);
};

const runAddRecipeToCookBook = async (user: User, body: any): ApiResponse<{}> => {
  let attachBody: AddRecipeToCookBookSchema;
  try {
    attachBody = await YAddRecipeToCookBookSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to add a recipe to a cookbook",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

  const cookBook = await prisma.cookBook.findFirst({
    where: {
      id: attachBody.cookbook_id,
    }
  });

  if(!cookBook) {
    return [StatusCodes.NOT_FOUND, {
      message: "CookBook does not exist",
    }];
  }

  const recipe = await prisma.recipe.findFirst({
    where: {
      id: attachBody.recipe_id,
    }
  });

  if(!recipe) {
    return [StatusCodes.NOT_FOUND, {
      message: "Recipe does not exist",
    }];
  }

  /**
   * You cannot attach recipes to cookbooks you do not own.
   */
  if(cookBook.user_id !== user.id) {
    console.warn(`User ${user.id} attempted to attach recipe ${recipe.id} to ${cookBook.id}. They do not own the cookbook.`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "CookBook does not exist",
      }
    ]
  }

  /**
   * If you don't own a recipe, and that recipe is private, you cannot attach it to your cookbook.
   * You can, however, attach other people's recipes into your cookbooks provided that they are public.
   */
  if(recipe.private && recipe.user_id !== user.id) {
    console.warn(`User ${user.id} attempted to attach recipe ${recipe.id} to ${cookBook.id}. They do not own the recipe and the recipe is private.`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Recipe does not exist",
      }
    ]
  }

  try {
    await prisma.recipeCookBookAttachment.create({
      data: {
        cookbook: {
          connect: {
            id: attachBody.cookbook_id,
          }
        },
        recipe: {
          connect: {
            id: attachBody.recipe_id,
          }
        }
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
