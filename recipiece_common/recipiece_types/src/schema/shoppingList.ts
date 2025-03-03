import { array, boolean, date, InferType, number, object, string } from "yup";
import { generateYListQueryResponseSchema, YListQuerySchema } from "./list";
import { YUserKitchenMembershipSchema } from "./user";

export const YShoppingListItemSchema = object({
  id: number().required(),
  shopping_list_id: number().required(),
  completed: boolean().required(),
  order: number().required(),
  content: string().required(),
  notes: string().notRequired().nullable(),
}).noUnknown();

export const YShoppingListShareSchema = object({
  id: number().required(),
  created_at: date().required(),
  shopping_list_id: number().required(),
  user_kitchen_membership_id: number().required(),
});

export const YShoppingListSchema = object({
  id: number().required(),
  name: string().required(),
  created_at: date().required(),
  user_id: number().required(),
  items: array(YShoppingListItemSchema).notRequired(),
  shares: array(YShoppingListShareSchema).notRequired(),
}).noUnknown();

export interface ShoppingListSchema extends InferType<typeof YShoppingListSchema> {}

export interface ShoppingListItemSchema extends InferType<typeof YShoppingListItemSchema> {}

export interface ShoppingListShareSchema extends InferType<typeof YShoppingListShareSchema> {}

/**
 * Create shopping list
 */
export const YCreateShoppingListRequestSchema = object({
  name: string().required(),
}).noUnknown();

export interface CreateShoppingListRequestSchema extends InferType<typeof YCreateShoppingListRequestSchema> {}

/**
 * Update shopping list
 */
export const YUpdateShoppingListRequestSchema = object({
  id: number().required(),
  name: string().notRequired(),
}).noUnknown();

export interface UpdateShoppingListRequestSchema extends InferType<typeof YUpdateShoppingListRequestSchema> {}

/**
 * List shopping lists schema
 */
export const YListShoppingListsQuerySchema = YListQuerySchema.shape({
  shared_shopping_lists_filter: string().oneOf(["include", "exclude"]).notRequired(),
})
  .transform((val) => {
    return {
      ...val,
      shared_shopping_lists_filter: val.shared_shopping_lists_filter ?? "include",
    };
  })
  .noUnknown();

export interface ListShoppingListsQuerySchema extends InferType<typeof YListShoppingListsQuerySchema> {}

export const YListShoppingListsResponseSchema = generateYListQueryResponseSchema(YShoppingListSchema);

export interface ListShoppingListsResponseSchema extends InferType<typeof YListShoppingListsResponseSchema> {}

/**
 * Request shopping list session
 */
export const YRequestShoppingListSessionResponseSchema = object({
  token: string().uuid().required(),
}).noUnknown();

export interface RequestShoppingListSessionResponseSchema extends InferType<typeof YRequestShoppingListSessionResponseSchema> {}

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
  "set_item_notes",
  "__ping__",
];

export const YModifyShoppingListMessage = object({
  action: string().oneOf([...MODIFY_SHOPPING_LIST_ACTIONS]),
  item: YShoppingListItemSchema.partial().notRequired().default(undefined),
}).noUnknown();

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
}).noUnknown();

export interface AppendShoppingListItemsRequestSchema extends InferType<typeof YAppendShoppingListItemsRequestSchema> {}

export const YAppendShoppingListItemsResponseSchema = array(YShoppingListItemSchema).required();

export interface AppendShoppingListItemsResponseSchema extends InferType<typeof YAppendShoppingListItemsResponseSchema> {}

/**
 * Create ShoppingList Share
 */
export const YCreateShoppingListShareRequestSchema = object({
  user_kitchen_membership_id: number().required(),
  shopping_list_id: number().required(),
}).noUnknown();

export interface CreateShoppingListShareRequestSchema extends InferType<typeof YCreateShoppingListShareRequestSchema> {}

/**
 * List ShoppingList Shares
 */
export const YListShoppingListSharesQuerySchema = YListQuerySchema.shape({
  targeting_self: boolean().notRequired(),
  from_self: boolean().notRequired(),
  user_kitchen_membership_id: number().notRequired(),
})
  .test("onlyOneOfTargetingSelfOrFromSelf", "Must specify only one of targeting_self or from_self", (ctx) => {
    return !ctx.from_self || !ctx.targeting_self;
  })
  .noUnknown();

export interface ListShoppingListSharesQuerySchema extends InferType<typeof YListShoppingListSharesQuerySchema> {}

export const YListShoppingListSharesResponseSchema = generateYListQueryResponseSchema(
  YShoppingListShareSchema.shape({
    shopping_list: object({
      id: number().required(),
      name: string().required(),
    }).required(),
    user_kitchen_membership: YUserKitchenMembershipSchema.required(),
  })
).noUnknown();

export interface ListShoppingListSharesResponseSchema extends InferType<typeof YListShoppingListSharesResponseSchema> {}
