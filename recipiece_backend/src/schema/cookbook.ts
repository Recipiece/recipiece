import { boolean, InferType, number, object, string } from "yup";

export const YCookBookSchema = object({
  id: number().required(),
  user_id: number().required(),
  name: string().required(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
}).strict().noUnknown();

export interface CookBookSchema extends InferType<typeof YCookBookSchema> {}


/**
 * Create cookbook schema
 */
export const YCreateCookBookSchema = object({
  name: string().required(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
}).strict().noUnknown();

export interface CreateCookBookSchema extends InferType<typeof YCreateCookBookSchema> {}

/**
 * Update cookbook schema
 */
export const YUpdateCookBookSchema = object({
  id: number().required(),
  name: string().notRequired(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
}).strict().noUnknown();

export interface UpdateCookBookSchema extends InferType<typeof YUpdateCookBookSchema> {}


/**
 * Attach recipe to cookbook schema
 */
export const YAddRecipeToCookBookSchema = object({
  cookbook_id: number().required(),
  recipe_id: number().required(),
}).strict().noUnknown();

export interface AddRecipeToCookBookSchema extends InferType<typeof YAddRecipeToCookBookSchema> {}


/**
 * Attach recipe to cookbook schema
 */
export const YRemoveRecipeFromCookBookSchema = object({
  cookbook_id: number().required(),
  recipe_id: number().required(),
}).strict().noUnknown();

export interface RemoveRecipeFromCookBookSchema extends InferType<typeof YRemoveRecipeFromCookBookSchema> {}
