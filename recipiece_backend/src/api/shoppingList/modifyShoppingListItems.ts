import { ShoppingListItem } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ModifyShoppingListMessage, ShoppingListItemSchema } from "../../schema";
import { WebsocketMethod, WebsocketRequest } from "../../types";

const getCurrentItems: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (req: WebsocketRequest<ModifyShoppingListMessage>) => {
  const shoppingListId = req.ws_token_payload.entity_id;
  const items = await prisma.shoppingListItem.findMany({
    where: {
      shopping_list_id: +shoppingListId,
    },
    orderBy: {
      order: "asc",
    },
  });
  return [StatusCodes.OK, items];
};

const addItem: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (req: WebsocketRequest<ModifyShoppingListMessage>) => {
  const shoppingListId = req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToAdd = message.item as ShoppingListItemSchema;

  await prisma.shoppingListItem.create({
    data: {
      ...itemToAdd,
      shopping_list_id: +shoppingListId,
    },
  });
  const items = await prisma.shoppingListItem.findMany({
    where: {
      shopping_list_id: +shoppingListId,
    },
    orderBy: {
      order: "asc",
    },
  });
  return [StatusCodes.OK, items];
};

const markItemComplete: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (req: WebsocketRequest<ModifyShoppingListMessage>) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToComplete = message.item as ShoppingListItemSchema;

  const items = await prisma.$transaction(async (tx) => {
    const maxCompletedItem = await tx.shoppingListItem.count({
      where: {
        shopping_list_id: shoppingListId,
        completed: true,
      },
    });
    await tx.shoppingListItem.update({
      where: {
        id: itemToComplete.id,
      },
      data: {
        completed: true,
        order: maxCompletedItem,
      },
    });
    return await tx.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingListId,
      },
    });
  });

  return [StatusCodes.OK, items];
};

const MESSAGE_ACTION_MAP: { readonly [k: string]: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> } = {
  current_items: getCurrentItems,
  add_item: addItem,
  mark_item_complete: markItemComplete,
};

export const modifyShoppingListItems: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (req: WebsocketRequest<ModifyShoppingListMessage>) => {
  const message = req.ws_message;

  const handler = MESSAGE_ACTION_MAP[message.action!];
  if (handler) {
    return await handler(req);
  } else {
    return [StatusCodes.BAD_REQUEST, { message: `Unknown action: ${message.action}` }];
  }
};
