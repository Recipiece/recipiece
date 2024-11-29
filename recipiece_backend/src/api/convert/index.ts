import { Route } from "../../types";
import { Versions } from "../../util/constant";
import { convertIngredient } from "./convertIngredient";

export const CONVERT_ROUTES: Route[] = [
  {
    path: "/convert/ingredient",
    authentication: "access_token",
    method: "POST",
    function: convertIngredient,
    version: Versions.ALL,
  },
];
