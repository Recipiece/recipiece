import { collapseOrders, MAX_NUM_ITEMS, prisma, ShoppingListItem } from "@recipiece/database";
import { ModifyShoppingListMessage, ModifyShoppingListResponse, ShoppingListItemSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ErrorResponse, WebsocketMethod, WebsocketRequest } from "../../types";

const getCurrentItems: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = req.ws_token_payload.entity_id;
  const items = await prisma.shoppingListItem.findMany({
    where: {
      shopping_list_id: +shoppingListId,
    },
    orderBy: [
      {
        completed: "asc",
      },
      {
        order: "asc",
      },
    ],
  });
  return [StatusCodes.OK, items];
};

const addItem: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToAdd = message.item as ShoppingListItemSchema;
  const { id, order, shopping_list_id, ...restItem } = itemToAdd;

  const items = await prisma.$transaction(async (tx) => {
    const maxShoppingListItem = await tx.shoppingListItem.count({
      where: {
        shopping_list_id: shoppingListId,
        completed: itemToAdd.completed,
      },
    });
    await tx.shoppingListItem.create({
      data: {
        ...restItem,
        shopping_list_id: shoppingListId,
        order: maxShoppingListItem + 1,
      },
    });
    return await tx.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingListId,
      },
      orderBy: [
        {
          completed: "asc",
        },
        {
          order: "asc",
        },
      ],
    });
  });
  return [StatusCodes.OK, items];
};

const markItemComplete: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToComplete = message.item as ShoppingListItemSchema;

  const items = await prisma.$transaction(async (tx) => {
    await tx.shoppingListItem.updateMany({
      where: {
        id: itemToComplete.id,
        completed: false,
      },
      data: {
        completed: true,
        order: MAX_NUM_ITEMS,
      },
    });
    return await collapseOrders(shoppingListId, tx);
  });

  return [StatusCodes.OK, items];
};

const markItemIncomplete: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToComplete = message.item as ShoppingListItemSchema;

  const items = await prisma.$transaction(async (tx) => {
    await tx.shoppingListItem.updateMany({
      where: {
        id: itemToComplete.id,
        completed: true,
      },
      data: {
        completed: false,
        order: MAX_NUM_ITEMS,
      },
    });
    return await collapseOrders(shoppingListId, tx);
  });
  return [StatusCodes.OK, items];
};

const deleteItem: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToComplete = message.item as ShoppingListItemSchema;

  const items = await prisma.$transaction(async (tx) => {
    await tx.shoppingListItem.deleteMany({
      where: {
        id: itemToComplete.id,
        shopping_list_id: shoppingListId,
      },
    });
    return await collapseOrders(shoppingListId, tx);
  });
  return [StatusCodes.OK, items];
};

const setItemOrder: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToSet = message.item as ShoppingListItemSchema;

  const items = await prisma.$transaction(async (tx) => {
    const oldItem = await tx.shoppingListItem.findFirstOrThrow({
      where: {
        shopping_list_id: shoppingListId,
        id: itemToSet.id,
      },
    });

    await tx.$executeRaw`
      with
        max_num as (
          select
            count(*) as num_items
          from
            shopping_list_items
          where
            shopping_list_id = ${shoppingListId} and
            completed = ${itemToSet.completed}
        )
      update
        shopping_list_items
      set
        "order" = least(greatest(${itemToSet.order}::int, 1), max_num.num_items)
      from
        max_num
      where
        id = ${itemToSet.id}
    `;

    /**
     * If we are moving the item to an order that is GREATER THAN the old one,
     * we want update all the items between old and new to have an order of order - 1.
     *
     * If we are moving the item to an order that is LESS THAN the old one
     * we want to update all the items between old and new to have an order of order + 1.
     *
     * Since we cannot change the order and the completed status at the same time, we
     * only check the orders respective to that value
     */
    if (itemToSet.order > oldItem.order) {
      await tx.$executeRaw`
        update
          shopping_list_items
        set
          "order" = "order" - 1
        where
          "order" <= ${itemToSet.order} and
          "order" >= ${oldItem.order} and
          completed = ${itemToSet.completed} and
          shopping_list_id = ${shoppingListId} and
          id != ${itemToSet.id}
      `;
    } else if (itemToSet.order < oldItem.order) {
      await tx.$executeRaw`
        update
          shopping_list_items
        set
          "order" = "order" + 1
        where
          "order" >= ${itemToSet.order} and
          "order" <= ${oldItem.order} and
          completed = ${itemToSet.completed} and
          shopping_list_id = ${shoppingListId} and
          id != ${itemToSet.id}
      `;
    }

    return await tx.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingListId,
      },
      orderBy: [
        {
          completed: "asc",
        },
        {
          order: "asc",
        },
      ],
    });
  });
  return [StatusCodes.OK, items];
};

const setItemContent: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToSet = message.item as ShoppingListItemSchema;

  const items = await prisma.$transaction(async (tx) => {
    await tx.shoppingListItem.updateMany({
      where: {
        shopping_list_id: shoppingListId,
        id: itemToSet.id,
      },
      data: {
        content: itemToSet.content,
      },
    });

    return await tx.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingListId,
      },
      orderBy: [
        {
          completed: "asc",
        },
        {
          order: "asc",
        },
      ],
    });
  });

  return [StatusCodes.OK, items];
};

const setItemNotes: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  const message = req.ws_message;
  const itemToSet = message.item as ShoppingListItemSchema;

  const items = await prisma.$transaction(async (tx) => {
    await tx.shoppingListItem.updateMany({
      where: {
        shopping_list_id: shoppingListId,
        id: itemToSet.id,
      },
      data: {
        notes: itemToSet.notes,
      },
    });

    return await tx.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingListId,
      },
      orderBy: [
        {
          completed: "asc",
        },
        {
          order: "asc",
        },
      ],
    });
  });

  return [StatusCodes.OK, items];
};

const clearItems: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const shoppingListId = +req.ws_token_payload.entity_id;
  await prisma.shoppingListItem.deleteMany({
    where: {
      shopping_list_id: shoppingListId,
    }
  });
  return [StatusCodes.OK, []];
};

const __ping__: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> = async (
  _: WebsocketRequest<ModifyShoppingListMessage>
) => {
  return [StatusCodes.OK, []];
};

const MESSAGE_ACTION_MAP: { readonly [k: string]: WebsocketMethod<ModifyShoppingListMessage, ShoppingListItem[]> } = {
  current_items: getCurrentItems,
  add_item: addItem,
  mark_item_complete: markItemComplete,
  mark_item_incomplete: markItemIncomplete,
  delete_item: deleteItem,
  set_item_order: setItemOrder,
  set_item_content: setItemContent,
  set_item_notes: setItemNotes,
  clear_items: clearItems,
  __ping__: __ping__,
};

export const modifyShoppingListItems: WebsocketMethod<ModifyShoppingListMessage, ModifyShoppingListResponse> = async (
  req: WebsocketRequest<ModifyShoppingListMessage>
) => {
  const message = req.ws_message;

  const handler = MESSAGE_ACTION_MAP[message.action!];
  if (handler) {
    const [statusCode, responseData] = await handler(req);
    if(statusCode === StatusCodes.OK) {
      return [statusCode, {
        responding_to_action: message.action!,
        items: responseData,
      } as ModifyShoppingListResponse]
    }
    else {
      return [statusCode, responseData as ErrorResponse];
    }
  } else {
    return [StatusCodes.BAD_REQUEST, { message: `Unknown action: ${message.action}` }];
  }
};
