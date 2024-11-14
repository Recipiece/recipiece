import { Route } from "../../types";
import { createShoppingList } from "./createShoppingList";
import { deleteShoppingList } from "./deleteShoppingList";
import { getShoppingList } from "./getShoppingList";
import { listShoppingLists } from "./listShoppingLists";
import { updateShoppingList } from "./updateShoppingList";

export const SHOPPING_LIST_ROUTES: Route[] = [
  {
    path: "/shopping-list",
    authentication: "token",
    method: "POST",
    function: createShoppingList,
  },
  {
    path: "/shopping-list",
    authentication: "token",
    method: "PUT",
    function: updateShoppingList,
  },
  {
    path: "/shopping-list/list",
    authentication: "token",
    method: "GET",
    function: listShoppingLists,
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
];
