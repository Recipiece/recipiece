import { PrismaTransaction } from "@recipiece/database";
import { ShoppingListSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { getShoppingListByIdQuery } from "./query";

export const getShoppingList = async (
  request: AuthenticatedRequest,
  tx: PrismaTransaction
): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const listId = +request.params.id;
  const list = await getShoppingListByIdQuery(tx, user, listId).executeTakeFirst();

  if (!list) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping List ${listId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, list as ShoppingListSchema];
};
