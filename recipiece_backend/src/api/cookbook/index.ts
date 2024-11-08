import { Route } from "../../types";
import { addRecipeToCookbook } from "./addRecipeToCookbook";
import { createCookbook } from "./createCookbook";
import { deleteCookbook } from "./deleteCookbook";
import { getCookbook } from "./getCookbook";
import { listCookbooks } from "./listCookbooks";
import { removeRecipeFromCookbook } from "./removeRecipeFromCookbook";
import { updateCookbook } from "./updateCookbook";

export const COOKBOOK_ROUTES: Route[] = [
  {
    path: "/cookbook",
    authentication: "token",
    method: "POST",
    function: createCookbook,
  },
  {
    path: "/cookbook/recipe/add",
    authentication: "token",
    method: "POST",
    function: addRecipeToCookbook,
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "token",
    method: "DELETE",
    function: deleteCookbook,
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "token",
    method: "GET",
    function: getCookbook,
  },
  {
    path: "/cookbook/list",
    authentication: "token",
    method: "GET",
    function: listCookbooks,
  },
  {
    path: "/cookbook/recipe/remove",
    authentication: "token",
    method: "POST",
    function: removeRecipeFromCookbook,
  },
  {
    path: "/cookbook",
    authentication: "token",
    method: "PUT",
    function: updateCookbook,
  },
];
