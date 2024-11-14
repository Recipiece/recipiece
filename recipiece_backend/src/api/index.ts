import { CONVERT_ROUTES } from "./convert";
import { COOKBOOK_ROUTES } from "./cookbook";
import { RECIPE_ROUTES } from "./recipe";
import { SHOPPING_LIST_ROUTES } from "./shoppingList";
import { LOGIN_ROUTES } from "./user";

export const ROUTES = [...LOGIN_ROUTES, ...RECIPE_ROUTES, ...COOKBOOK_ROUTES, ...CONVERT_ROUTES, ...SHOPPING_LIST_ROUTES];
