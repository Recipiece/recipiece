import { Route } from "../../types";
import { convertIngredient } from "./convertIngredient";

export const CONVERT_ROUTES: Route[] = [
  {
    path: "/convert/ingredient",
    authentication: "access_token",
    method: "POST",
    function: convertIngredient,
  },
];
