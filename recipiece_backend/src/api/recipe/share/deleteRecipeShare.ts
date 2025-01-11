import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const deleteRecipeShare = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const shareId = +request.params.id;

  const share = await prisma.recipeShare.findFirst({
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

  try {
    await prisma.recipeShare.delete({
      where: {
        id: share.id,
      },
    });
    return [StatusCodes.OK, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Internal server error",
      },
    ];
  }
};
