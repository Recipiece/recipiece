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
} from "../../schema";
import { Route } from "../../types";
import { Versions } from "../../util/constant";
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
    version: Versions.ALL,
  },
  {
    path: "/meal-plan",
    authentication: "access_token",
    method: "PUT",
    function: updateMealPlan,
    requestSchema: YUpdateMealPlanRequestSchema,
    responseSchema: YMealPlanSchema,
    version: Versions.ALL,
  },
  {
    path: "/meal-plan/list",
    authentication: "access_token",
    method: "GET",
    function: listMealPlans,
    requestSchema: YListMealPlanQuerySchema,
    responseSchema: YListMealPlanResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/meal-plan/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getMealPlanById,
    version: Versions.ALL,
    responseSchema: YMealPlanSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteMealPlan,
    version: Versions.ALL,
  },
  {
    path: "/meal-plan/:id(\\d+)/item/list",
    authentication: "access_token",
    method: "GET",
    function: listItemsForMealPlan,
    version: Versions.ALL,
    requestSchema: YListItemsForMealPlanQuerySchema,
    responseSchema: YListItemsForMealPlanResponseSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)/item",
    authentication: "access_token",
    method: "POST",
    function: createItemForMealPlan,
    version: Versions.ALL,
    requestSchema: YCreateMealPlanItemRequestSchema,
    responseSchema: YMealPlanItemSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)/item",
    authentication: "access_token",
    method: "PUT",
    function: updateItemForMealPlan,
    version: Versions.ALL,
    requestSchema: YUpdateMealPlanItemRequestSchema,
    responseSchema: YMealPlanItemSchema,
  },
  {
    path: "/meal-plan/:id(\\d+)/item/:itemId(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteItemForMealPlan,
    version: Versions.ALL,
  },
];
