import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const deleteRecipeShare = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const shareId = +request.params.id;

  const share = await tx.recipeShare.findFirst({
    where: {
      id: shareId,
      user_kitchen_membership: {
        source_user_id: request.user.id,
      },
      recipe: {
        user_id: request.user.id,
      },
    },
  });

  if (!share) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe share ${shareId} not found`,
      },
    ];
  }

  await tx.recipeShare.delete({
    where: {
      id: share.id,
    },
  });
  return [StatusCodes.OK, {}];
};
