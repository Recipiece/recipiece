import {
  YCreateRecipeRequestSchema,
  YListCookbooksResponseSchema,
  YListRecipesQuerySchema,
  YParseRecipeFromURLRequestSchema,
  YRecipeSchema,
  YUpdateRecipeRequestSchema,
} from "../../schema";
import { Route } from "../../types";
import { createRecipe } from "./createRecipe";
import { deleteRecipe } from "./deleteRecipe";
import { getRecipe } from "./getRecipe";
import { listRecipes } from "./listRecipes";
import { parseRecipeFromUrl } from "./parseFromUrl";
import { updateRecipe } from "./updateRecipe";

export const RECIPE_ROUTES: Route[] = [
  {
    path: "/recipe",
    authentication: "access_token",
    method: "POST",
    function: createRecipe,
    requestSchema: YCreateRecipeRequestSchema,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe",
    authentication: "access_token",
    method: "PUT",
    function: updateRecipe,
    requestSchema: YUpdateRecipeRequestSchema,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe/parse/url",
    authentication: "access_token",
    method: "POST",
    function: parseRecipeFromUrl,
    requestSchema: YParseRecipeFromURLRequestSchema,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe/list",
    authentication: "access_token",
    method: "GET",
    function: listRecipes,
    requestSchema: YListRecipesQuerySchema,
    responseSchema: YListCookbooksResponseSchema,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getRecipe,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteRecipe,
  },
];
