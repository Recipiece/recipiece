import { YListKnownIngredientsResponseSchema } from "@recipiece/types";
import { Route } from "../../types";
import { listKnownIngredients } from "./listKnownIngredients";

export const KNOWN_INGREDIENT_ROUTES: Route[] = [
  {
    path: "/known-ingredient/list",
    authentication: "access_token",
    function: listKnownIngredients,
    method: "GET",
    responseSchema: YListKnownIngredientsResponseSchema,
  },
];
