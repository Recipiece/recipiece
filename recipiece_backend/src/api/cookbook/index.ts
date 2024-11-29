import { YAddRecipeToCookbookRequestSchema, YCookbookSchema, YCreateCookbookRequestSchema, YListCookbooksQuerySchema, YListCookbooksResponseSchema, YRemoveRecipeFromCookbookRequestSchema, YUpdateCookbookRequestSchema } from "../../schema";
import { Route } from "../../types";
import { Versions } from "../../util/constant";
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
    authentication: "access_token",
    method: "POST",
    function: createCookbook,
    requestSchema: YCreateCookbookRequestSchema,
    responseSchema: YCookbookSchema,
    version: Versions.ALL,
  },
  {
    path: "/cookbook/recipe/add",
    authentication: "access_token",
    method: "POST",
    function: addRecipeToCookbook,
    requestSchema: YAddRecipeToCookbookRequestSchema,
    version: Versions.ALL,
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteCookbook,
    version: Versions.ALL,
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getCookbook,
    version: Versions.ALL,
  },
  {
    path: "/cookbook/list",
    authentication: "access_token",
    method: "GET",
    function: listCookbooks,
    requestSchema: YListCookbooksQuerySchema,
    responseSchema: YListCookbooksResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/cookbook/recipe/remove",
    authentication: "access_token",
    method: "POST",
    function: removeRecipeFromCookbook,
    requestSchema: YRemoveRecipeFromCookbookRequestSchema,
    version: Versions.ALL,
  },
  {
    path: "/cookbook",
    authentication: "access_token",
    method: "PUT",
    function: updateCookbook,
    requestSchema: YUpdateCookbookRequestSchema,
    responseSchema: YCookbookSchema,
    version: Versions.ALL,
  },
];
