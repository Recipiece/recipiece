import { PrismaTransaction, Redis } from "@recipiece/database";
import { RequestShoppingListSessionResponseSchema } from "@recipiece/types";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { getShoppingListByIdQuery } from "./query";

export const requestShoppingListSession = async (req: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<RequestShoppingListSessionResponseSchema> => {
  const user = req.user;
  const shoppingListId = +req.params.id;

  const shoppingList = await getShoppingListByIdQuery(tx, user, shoppingListId).executeTakeFirst();

  if (!shoppingList) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping list ${shoppingListId} not found`,
      },
    ];
  }

  const wsToken = randomUUID().toString();
  const redis = await Redis.getInstance();

  await redis.hSet(`ws:${wsToken}`, ["purpose", "/shopping-list/modify", "entity_id", shoppingListId, "entity_type", "modifyShoppingListSession"]);
  await redis.sAdd(`modifyShoppingListSession:${shoppingListId}`, wsToken);

  return [
    StatusCodes.OK,
    {
      token: wsToken,
    },
  ];
};
