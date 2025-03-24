import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const deleteShoppingListShare = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const shareId = +request.params.id;

  const share = await tx.shoppingListShare.findFirst({
    where: {
      id: shareId,
      user_kitchen_membership: {
        OR: [{ source_user_id: request.user.id }, { destination_user_id: request.user.id }],
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
        message: `Shopping list share ${shareId} not found`,
      },
    ];
  }

  await tx.shoppingListShare.delete({
    where: {
      id: share.id,
    },
  });
  return [StatusCodes.OK, {}];
};
