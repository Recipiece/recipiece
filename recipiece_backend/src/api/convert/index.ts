import { Route } from "../../types";
import { convertIngredient } from "./convertIngredient";

export const CONVERT_ROUTES: Route[] = [
  {
    path: "/convert/ingredient",
    authentication: "token",
    method: "POST",
    function: convertIngredient,
  },
];
