import { Route } from "../../types";
import { createRecipe } from "./createRecipe";
import { deleteRecipe } from "./deleteRecipe";
import { getRecipe } from "./getRecipe";
import { listRecipes } from "./listRecipes";

export const RECIPE_ROUTES: Route[] = [
  {
    path: "/recipe",
    authentication: "token",
    method: "POST",
    function: createRecipe,
  },
  {
    path: "/recipe/list",
    authentication: "token",
    method: "GET",
    function: listRecipes,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "token",
    method: "GET",
    function: getRecipe,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "token",
    method: "DELETE",
    function: deleteRecipe,
  },
];
