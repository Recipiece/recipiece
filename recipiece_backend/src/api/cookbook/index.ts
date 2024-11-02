import { Route } from "../../types";
import { addRecipeToCookBook } from "./addRecipeToCookbook";
import { createCookBook } from "./createCookbook";
import { deleteCookBook } from "./deleteCookbook";
import { getCookBook } from "./getCookbook";
import { listCookBooks } from "./listCookbooks";
import { removeRecipeFromCookBook } from "./removeRecipeFromCookbook";
import { updateCookbook } from "./updateCookbook";

export const COOKBOOK_ROUTES: Route[] = [
  {
    path: "/cookbook",
    authentication: "token",
    method: "POST",
    function: createCookBook,
  },
  {
    path: "/cookbook/recipe/add",
    authentication: "token",
    method: "POST",
    function: addRecipeToCookBook,
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "token",
    method: "DELETE",
    function: deleteCookBook,
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "token",
    method: "GET",
    function: getCookBook,
  },
  {
    path: "/cookbook/list",
    authentication: "token",
    method: "GET",
    function: listCookBooks,
  },
  {
    path: "/cookbook/recipe/remove",
    authentication: "token",
    method: "POST",
    function: removeRecipeFromCookBook,
  },
  {
    path: "/cookbook",
    authentication: "token",
    method: "PUT",
    function: updateCookbook,
  },
];
