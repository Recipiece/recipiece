import {
  YCreateMealPlanItemRequestSchema,
  YCreateMealPlanRequestSchema,
  YListItemsForMealPlanQuerySchema,
  YListItemsForMealPlanResponseSchema,
  YListMealPlanQuerySchema,
  YListMealPlanResponseSchema,
  YMealPlanItemSchema,
  YMealPlanSchema,
  YUpdateMealPlanItemRequestSchema,
  YUpdateMealPlanRequestSchema,
} from "@recipiece/types";
import { Route } from "../../types";
import { createMealPlan } from "./createMealPlan";
import { deleteMealPlan } from "./deleteMealPlan";
import { getMealPlanById } from "./getMealPlanById";
import { createItemForMealPlan, deleteItemForMealPlan, listItemsForMealPlan, updateItemForMealPlan } from "./items";
import { listMealPlans } from "./listMealPlans";
import { updateMealPlan } from "./updateMealPlan";

export const MEAL_PLAN_ROUTES: Route[] = [
  {
    path: "/meal-plan",
    authentication: "access_token",
    method: "POST",
    function: createMealPlan,
    requestSchema: YCreateMealPlanRequestSchema,
    responseSchema: YMealPlanSchema,
  },
  {
    path: "/meal-plan",
    authentication: "access_token",
    method: "PUT",
    function: updateMealPlan,
    requestSchema: YUpdateMealPlanRequestSchema,
    responseSchema: YMealPlanSchema,
  },
  {
    path: "/meal-plan/list",
    authentication: "access_token",
    method: "GET",
    function: listMealPlans,
    requestSchema: YListMealPlanQuerySchema,
    responseSchema: YListMealPlanResponseSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getMealPlanById,
    responseSchema: YMealPlanSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteMealPlan,
  },
  {
    path: "/meal-plan/:id(\\d+)/item/list",
    authentication: "access_token",
    method: "GET",
    function: listItemsForMealPlan,
    requestSchema: YListItemsForMealPlanQuerySchema,
    responseSchema: YListItemsForMealPlanResponseSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)/item",
    authentication: "access_token",
    method: "POST",
    function: createItemForMealPlan,

    requestSchema: YCreateMealPlanItemRequestSchema,
    responseSchema: YMealPlanItemSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)/item",
    authentication: "access_token",
    method: "PUT",
    function: updateItemForMealPlan,

    requestSchema: YUpdateMealPlanItemRequestSchema,
    responseSchema: YMealPlanItemSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)/item/:itemId(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteItemForMealPlan,
  },
];
