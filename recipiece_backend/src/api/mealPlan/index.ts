import {
  YCreateMealPlanItemRequestSchema,
  YCreateMealPlanRequestSchema,
  YListItemsForMealPlanQuerySchema,
  YListItemsForMealPlanResponseSchema,
  YListMealPlanQuerySchema,
  YListMealPlanResponseSchema,
  YMealPlanConfigurationSchema,
  YMealPlanItemSchema,
  YMealPlanSchema,
  YModifyMealPlanMessage,
  YModifyMealPlanResponse,
  YRequestMealPlanSessionResponseSchema,
  YSetMealPlanConfigurationRequestSchema,
  YUpdateMealPlanItemRequestSchema,
  YUpdateMealPlanRequestSchema,
} from "@recipiece/types";
import { Route, WebsocketRoute } from "../../types";
import { createMealPlan } from "./createMealPlan";
import { deleteMealPlan } from "./deleteMealPlan";
import { getMealPlanById } from "./getMealPlanById";
import { createItemForMealPlan, deleteItemForMealPlan, listItemsForMealPlan, updateItemForMealPlan } from "./items";
import { listMealPlans } from "./listMealPlans";
import { requestMealPlanSession } from "./requestMealPlanSession";
import { updateMealPlan } from "./updateMealPlan";
import { modifyMealPlanItems } from "./modifyMealPlanItems";
import { setMealPlanConfiguration } from "./configuration/setMealPlanConfiguration";

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
  {
    path: "/meal-plan/:id(\\d+)/session",
    authentication: "access_token",
    method: "GET",
    function: requestMealPlanSession,
    responseSchema: YRequestMealPlanSessionResponseSchema,
  },
  {
    path: "/meal-plan/:id/configuration",
    authentication: "access_token",
    method: "PUT",
    function: setMealPlanConfiguration,
    requestSchema: YSetMealPlanConfigurationRequestSchema,
    responseSchema: YMealPlanConfigurationSchema,
  },
];

export const MEAL_PLAN_WEBSOCKET_ROUTES: WebsocketRoute[] = [
  {
    path: "/meal-plan/modify",
    authentication: "token",
    function: modifyMealPlanItems,
    requestSchema: YModifyMealPlanMessage,
    responseSchema: YModifyMealPlanResponse,
  },
];
