import { boolean, date, InferType, number, object, string } from "yup";

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
  shopping_list_id: string().required(),
  completed: boolean().required(),
  order: number().required(),
})
  .strict()
  .noUnknown();

export interface ShoppingListSchema extends InferType<typeof YShoppingListSchema> {}

export interface ShoppingListItemSchema extends InferType<typeof YShoppingListItemSchema> {}

/**
 * Create shopping list
 */
