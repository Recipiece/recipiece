import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { CreateShoppingListRequestSchema, ShoppingListSchema } from "@recipiece/types";
import { PrismaTransaction } from "@recipiece/database";

export const createShoppingList = async (request: AuthenticatedRequest<CreateShoppingListRequestSchema>, tx: PrismaTransaction): ApiResponse<ShoppingListSchema> => {
  const user = request.user;
  const body = request.body;

  const shoppingList = await tx.shoppingList.create({
    data: {
      ...body,
      user_id: user.id,
    },
  });
  return [StatusCodes.CREATED, shoppingList];
};
