import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { PrismaTransaction } from "@recipiece/database";

export const deleteShoppingList = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const listId = +request.params.id;
  const user = request.user;

  const shoppingList = await tx.shoppingList.findUnique({
    where: {
      id: listId,
      user_id: user.id,
    },
  });

  if (!shoppingList) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping List ${listId} not found`,
      },
    ];
  }

  await tx.shoppingList.delete({
    where: {
      id: listId,
    },
  });

  return [StatusCodes.OK, {}];
};
