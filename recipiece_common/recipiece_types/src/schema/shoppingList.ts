import { array, boolean, date, InferType, number, object, string } from "yup";
import { generateYListQuerySchema, YListQuerySchema } from "./list";
import { YUserKitchenMembershipSchema } from "./user";

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
})
  .strict()
  .noUnknown();

export interface ShoppingListSchema extends InferType<typeof YShoppingListSchema> {}

export interface ShoppingListItemSchema extends InferType<typeof YShoppingListItemSchema> {}

export interface ShoppingListShareSchema extends InferType<typeof YShoppingListShareSchema> {}

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
  shared_shopping_lists: string().oneOf(["include", "exclude"]).notRequired().default("include"),
})
  .strict()
  .noUnknown();

export interface ListShoppingListsQuerySchema extends InferType<typeof YListShoppingListsQuerySchema> {}

export const YListShoppingListsResponseSchema = generateYListQuerySchema(YShoppingListSchema);

export interface ListShoppingListsResponseSchema extends InferType<typeof YListShoppingListsResponseSchema> {}

/**
 * Request shopping list session
 */
export const YRequestShoppingListSessionResponseSchema = object({
  token: string().uuid().required(),
}).strict().noUnknown();

export interface RequestShoppingListSessionResponseSchema extends InferType<typeof YRequestShoppingListSessionResponseSchema>{}

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

/**
 * Create ShoppingList Share
 */
export const YCreateShoppingListShareRequestSchema = object({
  user_kitchen_membership_id: number().required(),
  shopping_list_id: number().required(),
})
  .strict()
  .noUnknown();

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
  .strict()
  .noUnknown();

export interface ListShoppingListSharesQuerySchema extends InferType<typeof YListShoppingListSharesQuerySchema> {}

export const YListShoppingListSharesResponseSchema = generateYListQuerySchema(
  YShoppingListShareSchema.shape({
    shopping_list: object({
      id: number().required(),
      name: string().required(),
    }).required(),
    user_kitchen_membership: YUserKitchenMembershipSchema.required(),
  })
)
  .strict()
  .noUnknown();

export interface ListShoppingListSharesResponseSchema extends InferType<typeof YListShoppingListSharesResponseSchema> {}
