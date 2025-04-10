import { PrismaTransaction } from "@recipiece/database";
import { ShoppingListSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateShoppingList = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const { id, ...restBody } = request.body;

  const shoppingList = await tx.shoppingList.findUnique({
    where: {
      id: id,
      user_id: user.id,
    },
  });

  if (!shoppingList) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping List ${id} not found`,
      },
    ];
  }

  const updatedList = await tx.shoppingList.update({
    where: {
      id: id,
    },
    data: {
      ...restBody,
    },
  });

  return [StatusCodes.OK, updatedList];
};
