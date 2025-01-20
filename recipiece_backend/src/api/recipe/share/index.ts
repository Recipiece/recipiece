import { YCreateRecipeShareRequestSchema, YListRecipeSharesQuerySchema, YListRecipeSharesResponseSchema, YRecipeShareSchema } from "@recipiece/types";
import { Route } from "../../../types";
import { createRecipeShare } from "./createRecipeShare";
import { deleteRecipeShare } from "./deleteRecipeShare";
import { listRecipeShares } from "./listRecipeShares";

export const RECIPE_SHARE_ROUTES: Route[] = [
  {
    path: "/recipe/share",
    authentication: "access_token",
    method: "POST",
    function: createRecipeShare,
    requestSchema: YCreateRecipeShareRequestSchema,
    responseSchema: YRecipeShareSchema,
  },
  {
    path: "/recipe/share/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteRecipeShare,
  },
  {
    path: "/recipe/share/list",
    authentication: "access_token",
    method: "GET",
    function: listRecipeShares,
    requestSchema: YListRecipeSharesQuerySchema,
    responseSchema: YListRecipeSharesResponseSchema,
  },
];
