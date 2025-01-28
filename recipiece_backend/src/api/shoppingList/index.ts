import {
  YAppendShoppingListItemsRequestSchema,
  YAppendShoppingListItemsResponseSchema,
  YCreateShoppingListRequestSchema,
  YCreateShoppingListShareRequestSchema,
  YListShoppingListSharesQuerySchema,
  YListShoppingListSharesResponseSchema,
  YListShoppingListsQuerySchema,
  YListShoppingListsResponseSchema,
  YModifyShoppingListMessage,
  YModifyShoppingListResponse,
  YRequestShoppingListSessionResponseSchema,
  YShoppingListSchema,
  YShoppingListShareSchema,
  YUpdateShoppingListRequestSchema
} from "@recipiece/types";
import { Route, WebsocketRoute } from "../../types";
import { appendShoppingListItems } from "./appendShoppingListItems";
import { createShoppingList } from "./createShoppingList";
import { deleteShoppingList } from "./deleteShoppingList";
import { getShoppingList } from "./getShoppingList";
import { listShoppingLists } from "./listShoppingLists";
import { modifyShoppingListItems } from "./modifyShoppingListItems";
import { requestShoppingListSession } from "./requestShoppingListSession";
import { createShoppingListShare, deleteShoppingListShare, listShoppingListShares } from "./share";
import { updateShoppingList } from "./updateShoppingList";

export const SHOPPING_LIST_ROUTES: Route[] = [
  {
    path: "/shopping-list",
    authentication: "access_token",
    method: "POST",
    function: createShoppingList,
    requestSchema: YCreateShoppingListRequestSchema,
    responseSchema: YShoppingListSchema,
  },
  {
    path: "/shopping-list",
    authentication: "access_token",
    method: "PUT",
    function: updateShoppingList,
    requestSchema: YUpdateShoppingListRequestSchema,
    responseSchema: YShoppingListSchema,
  },
  {
    path: "/shopping-list/list",
    authentication: "access_token",
    method: "GET",
    function: listShoppingLists,
    requestSchema: YListShoppingListsQuerySchema,
    responseSchema: YListShoppingListsResponseSchema,
  },
  {
    path: "/shopping-list/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getShoppingList,
  },
  {
    path: "/shopping-list/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteShoppingList,
  },
  {
    path: "/shopping-list/:id(\\d+)/session",
    authentication: "access_token",
    method: "GET",
    function: requestShoppingListSession,
    responseSchema: YRequestShoppingListSessionResponseSchema,
  },
  {
    path: "/shopping-list/append-items",
    authentication: "access_token",
    method: "POST",
    function: appendShoppingListItems,
    requestSchema: YAppendShoppingListItemsRequestSchema,
    responseSchema: YAppendShoppingListItemsResponseSchema,
  },
  {
    path: "/shopping-list/share",
    authentication: "access_token",
    method: "POST",
    function: createShoppingListShare,
    requestSchema: YCreateShoppingListShareRequestSchema,
    responseSchema: YShoppingListShareSchema,
  },
  {
    path: "/shopping-list/share/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteShoppingListShare,
  },
  {
    path: "/shopping-list/share/list",
    authentication: "access_token",
    method: "GET",
    function: listShoppingListShares,
    requestSchema: YListShoppingListSharesQuerySchema,
    responseSchema: YListShoppingListSharesResponseSchema,
  },
];

export const SHOPPING_LIST_WEBSOCKET_ROUTES: WebsocketRoute[] = [
  {
    path: "/shopping-list/modify",
    authentication: "token",
    function: modifyShoppingListItems,
    requestSchema: YModifyShoppingListMessage,
    responseSchema: YModifyShoppingListResponse,
  },
];
