import { date, InferType, number, object, string } from "yup";
import { generateYListQuerySchema, YListQuerySchema } from "./list";

export const YCookbookSchema = object({
  id: number().required(),
  user_id: number().required(),
  name: string().required(),
  description: string().notRequired(),
  created_at: date().required(),
}).noUnknown();

export interface CookbookSchema extends InferType<typeof YCookbookSchema> {}

/**
 * Create cookbook schema
 */
export const YCreateCookbookRequestSchema = object({
  name: string().required(),
  description: string().notRequired(),
}).noUnknown();

export interface CreateCookbookRequestSchema extends InferType<typeof YCreateCookbookRequestSchema> {}

/**
 * Update cookbook schema
 */
export const YUpdateCookbookRequestSchema = object({
  id: number().required(),
  name: string().notRequired(),
  description: string().notRequired(),
}).noUnknown();

export interface UpdateCookbookRequestSchema extends InferType<typeof YUpdateCookbookRequestSchema> {}

/**
 * Attach recipe to cookbook schema
 */
export const YAddRecipeToCookbookRequestSchema = object({
  cookbook_id: number().required(),
  recipe_id: number().required(),
}).noUnknown();

export interface AddRecipeToCookbookRequestSchema extends InferType<typeof YAddRecipeToCookbookRequestSchema> {}

/**
 * Attach recipe to cookbook schema
 */
export const YRemoveRecipeFromCookbookRequestSchema = object({
  cookbook_id: number().required(),
  recipe_id: number().required(),
}).noUnknown();

export interface RemoveRecipeFromCookbookRequestSchema extends InferType<typeof YRemoveRecipeFromCookbookRequestSchema> {}

/**
 * List cookbooks schema
 */
export const YListCookbooksQuerySchema = YListQuerySchema.shape({
  exclude_containing_recipe_id: number().notRequired(),
  search: string().notRequired(),
}).noUnknown();

export interface ListCookbooksQuerySchema extends InferType<typeof YListCookbooksQuerySchema> {}

export const YListCookbooksResponseSchema = generateYListQuerySchema(YCookbookSchema);

export interface ListCookbooksResponseSchema extends InferType<typeof YListCookbooksResponseSchema> {}
