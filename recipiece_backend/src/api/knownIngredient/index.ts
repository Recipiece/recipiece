import { Route } from "../../types";
import { Versions } from "../../util/constant";
import { listKnownIngredients } from "./listKnownIngredients";

export const KNOWN_INGREDIENT_ROUTES: Route[] = [
  {
    path: "/known-ingredient/list",
    authentication: "access_token",
    function: listKnownIngredients,
    method: "GET",
    
  },
];
