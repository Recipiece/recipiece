import { array, boolean, date, InferType, number, object, string } from "yup";
import { generateYListQuerySchema, YListQuerySchema } from "./list";

export const YShoppingListSchema = object({
  id: number().required(),
  name: string().required(),
  created_at: date().required(),
  user_id: number().required(),
})
  .strict()
  .noUnknown();

export const YShoppingListItemSchema = object({
  id: number().required(),
  shopping_list_id: number().required(),
  completed: boolean().required(),
  order: number().required(),
  content: string().required(),
  notes: string().notRequired().nullable(),
})
  .strict()
  .noUnknown();

export interface ShoppingListSchema extends InferType<typeof YShoppingListSchema> {}

export interface ShoppingListItemSchema extends InferType<typeof YShoppingListItemSchema> {}

/**
 * Create shopping list
 */
export const YCreateShoppingListSchema = object({
  name: string().required(),
})
  .strict()
  .noUnknown();

export interface CreateShoppingListSchema extends InferType<typeof YCreateShoppingListSchema> {}

/**
 * Update shopping list
 */
export const YUpdateShoppingListSchema = object({
  id: number().required(),
  name: string().notRequired(),
})
  .strict()
  .noUnknown();

export interface UpdateShoppingListSchema extends InferType<typeof YUpdateShoppingListSchema> {}

/**
 * List shopping lists schema
 */
export const YListShoppingListsQuerySchema = YListQuerySchema.shape({
  user_id: number().notRequired(),
})
  .strict()
  .noUnknown();

export interface ListShoppingListsQuerySchema extends InferType<typeof YListShoppingListsQuerySchema> {}

export const YListShoppingListsResponseSchema = generateYListQuerySchema(YShoppingListSchema);

export interface ListShoppingListsResponseSchema extends InferType<typeof YListShoppingListsResponseSchema> {}

/**
 * Modify Shopping List
 */
const MODIFY_SHOPPING_LIST_ACTIONS = [
  "current_items",
  "mark_item_complete",
  "add_item",
  "delete_item",
  "set_item_complete",
  "mark_item_incomplete",
  "set_item_order",
  "set_item_content",
  "clear_items",
  "__ping__",
];

export const YModifyShoppingListMessage = object({
  action: string().oneOf([...MODIFY_SHOPPING_LIST_ACTIONS]),
  item: YShoppingListItemSchema.partial().notRequired().default(undefined),
})
  .strict()
  .noUnknown();

export interface ModifyShoppingListMessage extends InferType<typeof YModifyShoppingListMessage> {}

export const YModifyShoppingListResponse = object({
  responding_to_action: string().oneOf([...MODIFY_SHOPPING_LIST_ACTIONS]),
  items: array(YShoppingListItemSchema).strict().required(),
});

export interface ModifyShoppingListResponse extends InferType<typeof YModifyShoppingListResponse> {}

/**
 * Append Shopping List Items
 */
export const YAppendShoppingListItemsRequestSchema = object({
  shopping_list_id: number().required(),
  items: array(YShoppingListItemSchema.omit(["id", "order", "completed", "shopping_list_id"])).required(),
})
  .strict()
  .noUnknown();

export interface AppendShoppingListItemsRequestSchema extends InferType<typeof YAppendShoppingListItemsRequestSchema> {}

export const YAppendShoppingListItemsResponseSchema = array(YShoppingListItemSchema).strict().required();

export interface AppendShoppingListItemsResponseSchema
  extends InferType<typeof YAppendShoppingListItemsResponseSchema> {}
