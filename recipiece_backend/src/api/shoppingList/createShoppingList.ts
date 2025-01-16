import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { CreateShoppingListSchema, ShoppingListSchema } from "@recipiece/types";
import { prisma } from "@recipiece/database";

export const createShoppingList = async (request: AuthenticatedRequest<CreateShoppingListSchema>): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const body = request.body;

  try {
    const shoppingList = await prisma.shoppingList.create({
      data: {
        ...body,
        user_id: user.id,
      },
    });
    return [StatusCodes.CREATED, shoppingList];
  } catch (error) {
    console.error(error);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to create shopping list",
      },
    ];
  }
};
