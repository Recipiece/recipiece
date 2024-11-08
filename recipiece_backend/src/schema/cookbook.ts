import { boolean, InferType, number, object, string } from "yup";

export const YCookbookSchema = object({
  id: number().required(),
  user_id: number().required(),
  name: string().required(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
}).strict().noUnknown();

export interface CookbookSchema extends InferType<typeof YCookbookSchema> {}


/**
 * Create cookbook schema
 */
export const YCreateCookbookSchema = object({
  name: string().required(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
}).strict().noUnknown();

export interface CreateCookbookSchema extends InferType<typeof YCreateCookbookSchema> {}

/**
 * Update cookbook schema
 */
export const YUpdateCookbookSchema = object({
  id: number().required(),
  name: string().notRequired(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
}).strict().noUnknown();

export interface UpdateCookbookSchema extends InferType<typeof YUpdateCookbookSchema> {}


/**
 * Attach recipe to cookbook schema
 */
export const YAddRecipeToCookbookSchema = object({
  cookbook_id: number().required(),
  recipe_id: number().required(),
}).strict().noUnknown();

export interface AddRecipeToCookbookSchema extends InferType<typeof YAddRecipeToCookbookSchema> {}


/**
 * Attach recipe to cookbook schema
 */
export const YRemoveRecipeFromCookbookSchema = object({
  cookbook_id: number().required(),
  recipe_id: number().required(),
}).strict().noUnknown();

export interface RemoveRecipeFromCookbookSchema extends InferType<typeof YRemoveRecipeFromCookbookSchema> {}
