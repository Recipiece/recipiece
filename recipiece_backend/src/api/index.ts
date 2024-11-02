import { COOKBOOK_ROUTES } from "./cookbook";
import { RECIPE_ROUTES } from "./recipe";
import { LOGIN_ROUTES } from "./user";

export const ROUTES = [...LOGIN_ROUTES, ...RECIPE_ROUTES, ...COOKBOOK_ROUTES];
