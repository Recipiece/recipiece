import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const deleteShoppingListShare = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const shareId = +request.params.id;

  const share = await prisma.shoppingListShare.findFirst({
    where: {
      id: shareId,
      user_kitchen_membership: {
        source_user_id: request.user.id,
      },
      shopping_list: {
        user_id: request.user.id,
      },
    },
  });

  if (!share) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping List share ${shareId} not found`,
      },
    ];
  }

  try {
    await prisma.shoppingListShare.delete({
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
