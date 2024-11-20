import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { prisma, Redis } from "../../database";
import { randomUUID } from "crypto";

export const requestShoppingListSession = async (req: AuthenticatedRequest): ApiResponse<any> => {
  const user = req.user;
  const shoppingListId = +req.params.id;

  const shoppingList = await prisma.shoppingList.findUnique({
    where: {
      user_id: user.id,
      id: shoppingListId,
    },
  });

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
