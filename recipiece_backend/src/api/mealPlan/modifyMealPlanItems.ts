import { prisma } from "@recipiece/database";
import { ModifyMealPlanMessageSchema, ModifyMealPlanResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, WebsocketRequest } from "../../types";

const getCurrentItems = async (mealPlanId: number, message: ModifyMealPlanMessageSchema, tx?: any): Promise<ModifyMealPlanResponseSchema> => {
  const { start_date, end_date } = message;
  const items = await (tx ?? prisma).mealPlanItem.findMany({
    where: {
      start_date: {
        gte: start_date,
        lte: end_date,
      },
      meal_plan_id: mealPlanId,
    },
    orderBy: {
      start_date: "asc",
    },
    include: {
      recipe: true,
    },
  });
  return {
    responding_to_action: "current_items",
    items: items,
  };
};

const addItem = async (mealPlanId: number, message: ModifyMealPlanMessageSchema): Promise<ModifyMealPlanResponseSchema> => {
  const { item } = message;
  const allItems = await prisma.$transaction(async (tx) => {
    await tx.mealPlanItem.create({
      data: {
        ...item!,
        meal_plan_id: mealPlanId,
      },
    });
    const current = await getCurrentItems(mealPlanId, message, tx);
    return current.items;
  });
  return {
    responding_to_action: "add_item",
    items: allItems,
  };
};

const __ping__ = async (..._: any[]): Promise<ModifyMealPlanResponseSchema> => {
  return {
    responding_to_action: "__ping__",
    items: [],
  };
};

const ACTION_MAP = {
  current_items: getCurrentItems,
  add_item: addItem,
  __ping__: __ping__,
};

export const modifyMealPlanItems = async (request: WebsocketRequest<ModifyMealPlanMessageSchema>): ApiResponse<ModifyMealPlanResponseSchema> => {
  const mealPlanId = +request.ws_token_payload.entity_id;
  const { action } = request.ws_message;

  const callback = ACTION_MAP[action as keyof typeof ACTION_MAP];
  if (callback) {
    try {
      const responseMessage = await callback(mealPlanId, request.ws_message);
      return [StatusCodes.OK, responseMessage];
    } catch (err) {
      console.error(err);
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to process request",
        },
      ];
    }
  }

  return [
    StatusCodes.NOT_IMPLEMENTED,
    {
      message: `Unknown action ${action}`,
    },
  ];
};
