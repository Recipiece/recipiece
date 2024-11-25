import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { AppendShoppingListItemsRequestSchema, AppendShoppingListItemsResponseSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { collapseOrders, MAX_NUM_ITEMS } from "./util";

export const appendShoppingListItems = async (
  request: AuthenticatedRequest<AppendShoppingListItemsRequestSchema>
): ApiResponse<AppendShoppingListItemsResponseSchema> => {
  const shoppingListId = request.body.shopping_list_id;

  const shoppingList = await prisma.shoppingList.findFirst({
    where: {
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
  return [StatusCodes.OK, collapsed];
};
