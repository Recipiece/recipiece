import { PrismaTransaction } from "@recipiece/database";
import { RemoveRecipeFromCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { getCookbookByIdQuery } from "./query";

export const removeRecipeFromCookbook = async (
  req: AuthenticatedRequest<RemoveRecipeFromCookbookRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<{}> => {
  const removeBody = req.body;
  const user = req.user;

  const cookbook = await getCookbookByIdQuery(tx, user, removeBody.cookbook_id).executeTakeFirst();

  if (!cookbook) {
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
