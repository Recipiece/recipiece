import { PrismaTransaction } from "@recipiece/database";
import { AppendShoppingListItemsRequestSchema, AppendShoppingListItemsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { broadcastMessageViaEntityId } from "../../middleware";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { collapseOrders, getShoppingListByIdQuery } from "./query";
import { Constant } from "@recipiece/constant";

export const appendShoppingListItems = async (
  request: AuthenticatedRequest<AppendShoppingListItemsRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<AppendShoppingListItemsResponseSchema> => {
  const shoppingListId = request.body.shopping_list_id;
  const user = request.user;

  const shoppingList = await getShoppingListByIdQuery(tx, user, shoppingListId).executeTakeFirst();

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
      order: Constant.MAX_NUM_SHOPPING_LIST_ITEMS + idx,
      shopping_list_id: shoppingListId,
    };
  });

  await tx.shoppingListItem.createMany({
    data: sanitizedItems,
  });

  const collapsed = await collapseOrders(shoppingListId, tx);
  const websocketMessage = {
    responding_to_action: "append_from_recipe",
    items: collapsed,
  };

  // broadcast the message to any listening
  await broadcastMessageViaEntityId("modifyShoppingListSession", shoppingList.id, websocketMessage);

  return [StatusCodes.OK, collapsed as unknown as AppendShoppingListItemsResponseSchema];
};
