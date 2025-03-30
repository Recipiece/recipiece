import { Constant } from "@recipiece/constant";
import { array, date, InferType, number, object, string } from "yup";
import { generateYListQueryResponseSchema, YListQuerySchema } from "./list";
import { YUserTagSchema } from "./user";

export const YRecipeIngredientSchema = object({
  id: number().required(),
  recipe_id: number().required(),
  name: string().required(),
  unit: string().notRequired(),
  amount: string().notRequired(),
  order: number().required(),
}).noUnknown();

export const YRecipeStepSchema = object({
  id: number().required(),
  recipe_id: number().required(),
  order: number().required(),
  content: string().required(),
}).noUnknown();

export const YRecipeSchema = object({
  id: number().required(),
  user_id: number().required(),
  name: string().required(),
  created_at: date().required(),
  description: string().notRequired(),
  duration_ms: number().notRequired(),
  servings: number().notRequired(),
  ingredients: array().of(YRecipeIngredientSchema).notRequired(),
  steps: array().of(YRecipeStepSchema).notRequired(),
  tags: array().of(YUserTagSchema).notRequired(),
  user_kitchen_membership_id: number().notRequired(),
  // this is intentionally not the image_key or the external_image_url
  image_url: string().notRequired(),
  external_image_url: string().notRequired(),
}).noUnknown();

export interface RecipeSchema extends InferType<typeof YRecipeSchema> {}

export interface RecipeIngredientSchema extends InferType<typeof YRecipeIngredientSchema> {}

export interface RecipeStepSchema extends InferType<typeof YRecipeStepSchema> {}

/**
 * Create recipe schema
 */
export const YCreateRecipeRequestSchema = object({
  name: string().required(),
  description: string().notRequired(),
  servings: number().notRequired(),
  ingredients: array()
    .of(
      object({
        name: string().required(),
        unit: string().notRequired(),
        amount: string().notRequired(),
        order: number().required(),
      })
    )
    .notRequired(),
  steps: array()
    .of(
      object({
        order: number().required(),
        content: string().required(),
      })
    )
    .notRequired(),
  tags: array(string().required()).notRequired(),
  external_image_url: string().url().notRequired(),
}).noUnknown();

export interface CreateRecipeRequestSchema extends InferType<typeof YCreateRecipeRequestSchema> {}

/**
 * Parse recipe schema
 */
export const YParseRecipeFromURLRequestSchema = object({
  source_url: string().required(),
}).noUnknown();

export interface ParseRecipeFromURLRequestSchema extends InferType<typeof YParseRecipeFromURLRequestSchema> {}

export const YParseRecipeFromURLResponseSchema = YRecipeSchema.omit(["id", "user_id", "tags", "user_kitchen_membership_id", "created_at"]).shape({
  steps: array(YRecipeStepSchema.omit(["id", "recipe_id"])),
  ingredients: array(YRecipeIngredientSchema.omit(["id", "recipe_id"])),
  external_image_url: string().url().notRequired(),
});

export interface ParseRecipeFromURLResponseSchema extends InferType<typeof YParseRecipeFromURLResponseSchema> {}

export interface ParsedFromURLRecipe {
  readonly author?: string;
  readonly description?: string;
  readonly parsed_ingredients?: {
    readonly name: string;
    readonly amount?: string;
    readonly unit?: string;
  }[];
  readonly title?: string;
  readonly instructions_list?: string[];
  readonly image?: string;
}

/**
 * Update recipe schema
 */
export const YUpdateRecipeRequestSchema = object({
  id: number().required(),
  name: string().notRequired(),
  description: string().notRequired(),
  servings: number().notRequired(),
  ingredients: array()
    .of(
      object({
        name: string().required(),
        unit: string().notRequired(),
        amount: string().notRequired(),
        order: number().required(),
      })
    )
    .notRequired(),
  steps: array()
    .of(
      object({
        order: number().required(),
        content: string().required(),
      })
    )
    .notRequired(),
  tags: array(string().required()).notRequired(),
  external_image_url: string().url().notRequired(),
}).noUnknown();

export interface UpdateRecipeRequestSchema extends InferType<typeof YUpdateRecipeRequestSchema> {}

/**
 * List recipes schema
 */
export const YListRecipesQuerySchema = YListQuerySchema.shape({
  search: string().notRequired(),
  cookbook_id: number().notRequired(),
  cookbook_attachments_filter: string().oneOf(["include", "exclude"]).notRequired(),
  user_kitchen_membership_ids: array(string()).notRequired(),
  ingredients_filter: string().oneOf(["include", "exclude"]).notRequired(),
  tags_filter: string().oneOf(["include", "exclude"]).notRequired(),
  ingredients: array(string()).notRequired(),
  tags: array(string()).notRequired(),
})
  .transform((val) => {
    return {
      ...val,
      ingredients: val.ingredients ? val.ingredients.split(",") : undefined,
      tags: val.tags ? val.tags.split(",") : undefined,
      user_kitchen_membership_ids: val.user_kitchen_membership_ids ? val.user_kitchen_membership_ids.split(",") : [Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL],
      ingredients_filter: val.ingredients_filter ?? "include",
      tags_filter: val.tags_filter ?? "include",
    };
  })
  .strict()
  .noUnknown();

export interface ListRecipesQuerySchema extends InferType<typeof YListRecipesQuerySchema> {}

export const YListRecipesResponseSchema = generateYListQueryResponseSchema(YRecipeSchema);

export interface ListRecipesResponseSchema extends InferType<typeof YListRecipesResponseSchema> {}

/**
 * Fork Recipes Schema
 */
export const YForkRecipeRequestSchema = object({
  original_recipe_id: number().required(),
}).noUnknown();

export interface ForkRecipeRequestSchema extends InferType<typeof YForkRecipeRequestSchema> {}

/**
 * Set Recipe Image
 * NOTE: The request for this endpoint is form data, so no schema defined here :/
 */
export const YSetRecipeImageResponseSchema = object({
  image_url: string().required(),
});

export interface SetRecipeImageResponseSchema extends InferType<typeof YSetRecipeImageResponseSchema> {}
