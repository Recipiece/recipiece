import {
  YCreateRecipeRequestSchema,
  YListCookbooksResponseSchema,
  YListRecipesQuerySchema,
  YParseRecipeFromURLRequestSchema,
  YRecipeSchema,
  YUpdateRecipeRequestSchema,
} from "../../schema";
import { Route } from "../../types";
import { Versions } from "../../util/constant";
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
    version: Versions.ALL,
  },
  {
    path: "/recipe",
    authentication: "access_token",
    method: "PUT",
    function: updateRecipe,
    requestSchema: YUpdateRecipeRequestSchema,
    responseSchema: YRecipeSchema,
    version: Versions.ALL,
  },
  {
    path: "/recipe/parse/url",
    authentication: "access_token",
    method: "POST",
    function: parseRecipeFromUrl,
    requestSchema: YParseRecipeFromURLRequestSchema,
    responseSchema: YRecipeSchema,
    version: Versions.ALL,
  },
  {
    path: "/recipe/list",
    authentication: "access_token",
    method: "GET",
    function: listRecipes,
    requestSchema: YListRecipesQuerySchema,
    responseSchema: YListCookbooksResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getRecipe,
    responseSchema: YRecipeSchema,
    version: Versions.ALL,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteRecipe,
    version: Versions.ALL,
  },
];
