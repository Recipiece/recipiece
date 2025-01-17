import {
  YCreateShoppingListShareRequestSchema,
  YListShoppingListSharesQuerySchema,
  YListShoppingListSharesResponseSchema,
  YShoppingListShareSchema,
} from "@recipiece/types";
import { Route } from "../../../types";
import { createShoppingListShare } from "./createShoppingListShare";
import { deleteShoppingListShare } from "./deleteShoppingListShare";
import { listShoppingListShares } from "./listShoppingListShares";

export const SHOPPING_LIST_SHARE_ROUTES: Route[] = [
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
