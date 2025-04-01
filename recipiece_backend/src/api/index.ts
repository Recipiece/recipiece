import { COOKBOOK_ROUTES } from "./cookbook";
import { KNOWN_INGREDIENT_ROUTES } from "./knownIngredient";
import { MEAL_PLAN_ROUTES } from "./mealPlan";
import { NOTIFICATION_ROUTES } from "./notification";
import { RECIPE_ROUTES } from "./recipe";
import { SHOPPING_LIST_ROUTES, SHOPPING_LIST_WEBSOCKET_ROUTES } from "./shoppingList";
import { LOGIN_ROUTES } from "./user";
import { USER_KITCHEN_MEMBERSHIP_ROUTES } from "./userKitchenMembership";
import { USER_TAG_ROUTES } from "./userTag";

export const ROUTES = [
  ...LOGIN_ROUTES,
  ...RECIPE_ROUTES,
  ...COOKBOOK_ROUTES,
  ...SHOPPING_LIST_ROUTES,
  ...MEAL_PLAN_ROUTES,
  ...KNOWN_INGREDIENT_ROUTES,
  ...NOTIFICATION_ROUTES,
  ...USER_KITCHEN_MEMBERSHIP_ROUTES,
  ...USER_TAG_ROUTES,
];

export const WEBSOCKET_ROUTES = [...SHOPPING_LIST_WEBSOCKET_ROUTES];
