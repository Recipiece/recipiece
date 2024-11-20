import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ShoppingListSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getShoppingList = async (request: AuthenticatedRequest): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const listId = +request.params.id;

  const list = await prisma.shoppingList.findUnique({
    where: {
      user_id: user.id,
      id: listId,
    },
    include: {
      shopping_list_items: true,
    },
  });

  if (!list) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping List ${listId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, list];
};
