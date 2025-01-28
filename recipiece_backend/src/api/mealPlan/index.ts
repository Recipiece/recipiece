import {
  YBulkSetMealPlanItemsRequestSchema,
  YBulkSetMealPlanItemsResponseSchema,
  YCreateMealPlanItemRequestSchema,
  YCreateMealPlanRequestSchema,
  YCreateMealPlanShareRequestSchema,
  YListItemsForMealPlanQuerySchema,
  YListItemsForMealPlanResponseSchema,
  YListMealPlanSharesQuerySchema,
  YListMealPlanSharesResponseSchema,
  YListMealPlansQuerySchema,
  YListMealPlansResponseSchema,
  YMealPlanConfigurationSchema,
  YMealPlanItemSchema,
  YMealPlanSchema,
  YMealPlanShareSchema,
  YSetMealPlanConfigurationRequestSchema,
  YUpdateMealPlanItemRequestSchema,
  YUpdateMealPlanRequestSchema
} from "@recipiece/types";
import { Route } from "../../types";
import { setMealPlanConfiguration } from "./configuration/setMealPlanConfiguration";
import { createMealPlan } from "./createMealPlan";
import { deleteMealPlan } from "./deleteMealPlan";
import { getMealPlanById } from "./getMealPlanById";
import { bulkSetMealPlanItems, createItemForMealPlan, deleteItemForMealPlan, listItemsForMealPlan, updateItemForMealPlan } from "./items";
import { listMealPlans } from "./listMealPlans";
import { createMealPlanShare, deleteMealPlanShare, listMealPlanShares } from "./share";
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
    requestSchema: YListMealPlansQuerySchema,
    responseSchema: YListMealPlansResponseSchema,
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
    path: "/meal-plan/:id/configuration",
    authentication: "access_token",
    method: "PUT",
    function: setMealPlanConfiguration,
    requestSchema: YSetMealPlanConfigurationRequestSchema,
    responseSchema: YMealPlanConfigurationSchema,
  },
  {
    path: "/meal-plan/:id/item/bulk-set",
    authentication: "access_token",
    method: "POST",
    function: bulkSetMealPlanItems,
    requestSchema: YBulkSetMealPlanItemsRequestSchema,
    responseSchema: YBulkSetMealPlanItemsResponseSchema,
  },
  {
    path: "/meal-plan/share",
    authentication: "access_token",
    method: "POST",
    function: createMealPlanShare,
    requestSchema: YCreateMealPlanShareRequestSchema,
    responseSchema: YMealPlanShareSchema,
  },
  {
    path: "/meal-plan/share/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteMealPlanShare,
  },
  {
    path: "/meal-plan/share/list",
    authentication: "access_token",
    method: "GET",
    function: listMealPlanShares,
    requestSchema: YListMealPlanSharesQuerySchema,
    responseSchema: YListMealPlanSharesResponseSchema,
  },
];
