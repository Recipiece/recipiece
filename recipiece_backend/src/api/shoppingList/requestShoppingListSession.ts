import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { prisma, Redis } from "../../database";
import { randomUUID } from "crypto";
import { RequestShoppingListSessionResponseSchema } from "../../schema";
import { sharesWithMemberships } from "./util";

export const requestShoppingListSession = async (
  req: AuthenticatedRequest
): ApiResponse<RequestShoppingListSessionResponseSchema> => {
  const user = req.user;
  const shoppingListId = +req.params.id;

  const shoppingList = await prisma.$kysely
    .selectFrom("shopping_lists")
    .selectAll("shopping_lists")
    .where((eb) => {
      return eb.and([
        eb("shopping_lists.id", "=", shoppingListId),
        eb.or([
          eb("shopping_lists.user_id", "=", user.id),
          eb.exists(sharesWithMemberships(eb, user.id).select("shopping_list_shares.id").limit(1)),
        ]),
      ]);
    })
    .executeTakeFirst();

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

  await redis.hSet(`ws:${wsToken}`, [
    "purpose",
    "/shopping-list/modify",
    "entity_id",
    shoppingListId,
    "entity_type",
    "modifyShoppingListSession",
  ]);
  await redis.sAdd(`modifyShoppingListSession:${shoppingListId}`, wsToken);

  return [
    StatusCodes.OK,
    {
      token: wsToken,
    },
  ];
};
