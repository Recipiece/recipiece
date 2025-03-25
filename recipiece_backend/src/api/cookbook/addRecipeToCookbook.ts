import { PrismaTransaction } from "@recipiece/database";
import { AddRecipeToCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ConflictError } from "../../util/error";
import { getRecipeByIdQuery } from "../recipe/query";
import { getCookbookByIdQuery } from "./query";

export const addRecipeToCookbook = async (req: AuthenticatedRequest<AddRecipeToCookbookRequestSchema>, tx: PrismaTransaction): ApiResponse<{}> => {
  const attachBody = req.body;
  const user = req.user;

  const cookbook = await getCookbookByIdQuery(tx, user, attachBody.cookbook_id).executeTakeFirst();

  if (!cookbook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook does not exist",
      },
    ];
  }

  const cookbookOwner =
    cookbook.user_id === user.id
      ? user
      : await tx.user.findFirst({
          where: {
            id: cookbook.user_id,
          },
        });

  if (!cookbookOwner) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook owner not found",
      },
    ];
  }

  const recipe = await getRecipeByIdQuery(tx, cookbookOwner, attachBody.recipe_id).executeTakeFirst();

  if (!recipe) {
    const statusCode = cookbook.user_id === user.id ? StatusCodes.NOT_FOUND : StatusCodes.PRECONDITION_FAILED;
    return [
      statusCode,
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
