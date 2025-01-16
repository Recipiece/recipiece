import { collapseOrders, MAX_NUM_ITEMS, prisma, shoppingListSharesWithMemberships } from "@recipiece/database";
import { AppendShoppingListItemsRequestSchema, AppendShoppingListItemsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { broadcastMessageViaEntityId } from "../../middleware";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const appendShoppingListItems = async (
  request: AuthenticatedRequest<AppendShoppingListItemsRequestSchema>
): ApiResponse<AppendShoppingListItemsResponseSchema> => {
  const shoppingListId = request.body.shopping_list_id;
  const user = request.user;

  const shoppingList = await prisma.$kysely
    .selectFrom("shopping_lists")
    .selectAll("shopping_lists")
    .where((eb) => {
      return eb.and([
        eb("shopping_lists.id", "=", shoppingListId),
        eb.or([
          eb("shopping_lists.user_id", "=", user.id),
          eb.exists(shoppingListSharesWithMemberships(eb, user.id).select("shopping_list_shares.id").limit(1)),
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

  const sanitizedItems = request.body.items.map((item, idx) => {
    return {
      ...item,
      completed: false,
      order: MAX_NUM_ITEMS + idx,
      shopping_list_id: shoppingListId,
    };
  });

  await prisma.shoppingListItem.createMany({
    data: sanitizedItems,
  });

  const collapsed = await collapseOrders(shoppingListId);
  const websocketMessage = {
    responding_to_action: "append_from_recipe",
    items: collapsed,
  };

  // broadcast the message to any listening
  await broadcastMessageViaEntityId("modifyShoppingListSession", shoppingList.id, websocketMessage);

  return [StatusCodes.OK, collapsed as unknown as AppendShoppingListItemsResponseSchema];
};
