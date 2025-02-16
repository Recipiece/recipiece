import { PrismaTransaction } from "@recipiece/database";
import { RemoveRecipeFromCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const removeRecipeFromCookbook = async (req: AuthenticatedRequest<RemoveRecipeFromCookbookRequestSchema>, tx: PrismaTransaction): ApiResponse<{}> => {
  const removeBody = req.body;
  const user = req.user;

  const cookbook = await tx.cookbook.findFirst({
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

  await tx.recipeCookbookAttachment.delete({
    where: {
      id: {
        recipe_id: removeBody.recipe_id,
        cookbook_id: removeBody.cookbook_id,
      },
    },
  });

  return [StatusCodes.OK, {}];
};
