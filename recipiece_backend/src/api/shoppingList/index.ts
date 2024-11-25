import { YAppendShoppingListItemsRequestSchema, YAppendShoppingListItemsResponseSchema, YCreateShoppingListSchema, YListShoppingListsQuerySchema, YListShoppingListsResponseSchema, YModifyShoppingListMessage, YModifyShoppingListResponse, YShoppingListSchema, YUpdateShoppingListSchema } from "../../schema";
import { Route, WebsocketRoute } from "../../types";
import { appendShoppingListItems } from "./appendShoppingListItems";
import { createShoppingList } from "./createShoppingList";
import { deleteShoppingList } from "./deleteShoppingList";
import { getShoppingList } from "./getShoppingList";
import { listShoppingLists } from "./listShoppingLists";
import { modifyShoppingListItems } from "./modifyShoppingListItems";
import { requestShoppingListSession } from "./requestShoppingListSession";
import { updateShoppingList } from "./updateShoppingList";

export const SHOPPING_LIST_ROUTES: Route[] = [
  {
    path: "/shopping-list",
    authentication: "token",
    method: "POST",
    function: createShoppingList,
    requestSchema: YCreateShoppingListSchema,
    responseSchema: YShoppingListSchema,
  },
  {
    path: "/shopping-list",
    authentication: "token",
    method: "PUT",
    function: updateShoppingList,
    requestSchema: YUpdateShoppingListSchema,
    responseSchema: YShoppingListSchema,
  },
  {
    path: "/shopping-list/list",
    authentication: "token",
    method: "GET",
    function: listShoppingLists,
    requestSchema: YListShoppingListsQuerySchema,
    responseSchema: YListShoppingListsResponseSchema,
  },
  {
    path: "/shopping-list/:id(\\d+)",
    authentication: "token",
    method: "GET",
    function: getShoppingList,
  },
  {
    path: "/shopping-list/:id(\\d+)",
    authentication: "token",
    method: "DELETE",
    function: deleteShoppingList,
  },
  {
    path: "/shopping-list/:id(\\d+)/session",
    authentication: "token",
    method: "GET",
    function: requestShoppingListSession,
  },
  {
    path: "/shopping-list/append-items",
    authentication: "token",
    method: "POST",
    function: appendShoppingListItems,
    requestSchema: YAppendShoppingListItemsRequestSchema,
    responseSchema: YAppendShoppingListItemsResponseSchema,
  }
];

export const SHOPPING_LIST_WEBSOCKET_ROUTES: WebsocketRoute[] = [
  {
    path: "/shopping-list/modify",
    authentication: "token",
    function: modifyShoppingListItems,
    requestSchema: YModifyShoppingListMessage,
    responseSchema: YModifyShoppingListResponse,
  }
]
