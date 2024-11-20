import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ShoppingListSchema } from "../../schema";
import { prisma } from "../../database";

export const updateShoppingList = async (request: AuthenticatedRequest): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const { id, ...restBody } = request.body;

  const shoppingList = await prisma.shoppingList.findUnique({
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

  const updatedList = await prisma.shoppingList.update({
    where: {
      id: id,
    },
    data: {
      ...restBody,
    },
  });

  return [StatusCodes.OK, updatedList];
};
