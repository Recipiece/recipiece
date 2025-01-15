import { YAddRecipeToCookbookRequestSchema, YCookbookSchema, YCreateCookbookRequestSchema, YListCookbooksQuerySchema, YListCookbooksResponseSchema, YRemoveRecipeFromCookbookRequestSchema, YUpdateCookbookRequestSchema } from "@recipiece/types";
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
    authentication: "access_token",
    method: "POST",
    function: createCookbook,
    requestSchema: YCreateCookbookRequestSchema,
    responseSchema: YCookbookSchema,
    
  },
  {
    path: "/cookbook/recipe/add",
    authentication: "access_token",
    method: "POST",
    function: addRecipeToCookbook,
    requestSchema: YAddRecipeToCookbookRequestSchema,
    
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteCookbook,
    
  },
  {
    path: "/cookbook/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getCookbook,
    
  },
  {
    path: "/cookbook/list",
    authentication: "access_token",
    method: "GET",
    function: listCookbooks,
    requestSchema: YListCookbooksQuerySchema,
    responseSchema: YListCookbooksResponseSchema,
    
  },
  {
    path: "/cookbook/recipe/remove",
    authentication: "access_token",
    method: "POST",
    function: removeRecipeFromCookbook,
    requestSchema: YRemoveRecipeFromCookbookRequestSchema,
    
  },
  {
    path: "/cookbook",
    authentication: "access_token",
    method: "PUT",
    function: updateCookbook,
    requestSchema: YUpdateCookbookRequestSchema,
    responseSchema: YCookbookSchema,
    
  },
];
