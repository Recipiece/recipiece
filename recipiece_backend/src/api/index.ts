import { CONVERT_ROUTES } from "./convert";
import { COOKBOOK_ROUTES } from "./cookbook";
import { MEAL_PLAN_ROUTES } from "./mealPlan";
import { RECIPE_ROUTES } from "./recipe";
import { SHOPPING_LIST_ROUTES, SHOPPING_LIST_WEBSOCKET_ROUTES } from "./shoppingList";
import { TIMER_ROUTES } from "./timer";
import { LOGIN_ROUTES } from "./user";

export const ROUTES = [
  ...LOGIN_ROUTES,
  ...RECIPE_ROUTES,
  ...COOKBOOK_ROUTES,
  ...CONVERT_ROUTES,
  ...SHOPPING_LIST_ROUTES,
  ...TIMER_ROUTES,
  ...MEAL_PLAN_ROUTES,
];

export const WEBSOCKET_ROUTES = [...SHOPPING_LIST_WEBSOCKET_ROUTES];
