import {
  YAppendShoppingListItemsRequestSchema,
  YAppendShoppingListItemsResponseSchema,
  YCreateShoppingListSchema,
  YListShoppingListsQuerySchema,
  YListShoppingListsResponseSchema,
  YModifyShoppingListMessage,
  YModifyShoppingListResponse,
  YShoppingListSchema,
  YUpdateShoppingListSchema,
} from "../../schema";
import { Route, WebsocketRoute } from "../../types";
import { Versions } from "../../util/constant";
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
    authentication: "access_token",
    method: "POST",
    function: createShoppingList,
    requestSchema: YCreateShoppingListSchema,
    responseSchema: YShoppingListSchema,
    version: Versions.ALL,
  },
  {
    path: "/shopping-list",
    authentication: "access_token",
    method: "PUT",
    function: updateShoppingList,
    requestSchema: YUpdateShoppingListSchema,
    responseSchema: YShoppingListSchema,
    version: Versions.ALL,
  },
  {
    path: "/shopping-list/list",
    authentication: "access_token",
    method: "GET",
    function: listShoppingLists,
    requestSchema: YListShoppingListsQuerySchema,
    responseSchema: YListShoppingListsResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/shopping-list/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getShoppingList,
    version: Versions.ALL,
  },
  {
    path: "/shopping-list/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteShoppingList,
    version: Versions.ALL,
  },
  {
    path: "/shopping-list/:id(\\d+)/session",
    authentication: "access_token",
    method: "GET",
    function: requestShoppingListSession,
    version: Versions.ALL,
  },
  {
    path: "/shopping-list/append-items",
    authentication: "access_token",
    method: "POST",
    function: appendShoppingListItems,
    requestSchema: YAppendShoppingListItemsRequestSchema,
    responseSchema: YAppendShoppingListItemsResponseSchema,
    version: Versions.ALL,
  },
];

export const SHOPPING_LIST_WEBSOCKET_ROUTES: WebsocketRoute[] = [
  {
    path: "/shopping-list/modify",
    authentication: "token",
    function: modifyShoppingListItems,
    requestSchema: YModifyShoppingListMessage,
    responseSchema: YModifyShoppingListResponse,
    version: Versions.ALL,
  },
];
