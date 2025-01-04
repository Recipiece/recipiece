import { array, boolean, date, InferType, number, object, string } from "yup";
import { generateYListQuerySchema, YListQuerySchema } from "./list";
import { YUserKitchenMembershipSchema } from "./user";

export const YRecipeIngredientSchema = object({
  id: number().required(),
  recipe_id: number().required(),
  name: string().required(),
  unit: string().notRequired(),
  amount: string().notRequired(),
  order: number().required(),
})
  .strict()
  .noUnknown();

export const YRecipeStepSchema = object({
  id: number().required(),
  recipe_id: number().required(),
  order: number().required(),
  content: string().required(),
})
  .strict()
  .noUnknown();

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
})
  .strict()
  .noUnknown();

export interface RecipeSchema extends InferType<typeof YRecipeSchema> {}

export interface RecipeIngredientSchema extends InferType<typeof YRecipeIngredientSchema> {}

export interface RecipeStepSchema extends InferType<typeof YRecipeStepSchema> {}

export const YRecipeShareSchema = object({
  id: number().required(),
  created_at: date().required(),
  recipe_id: number().required(),
  user_kitchen_membership_id: number().required(),
});

export interface RecipeShareSchema extends InferType<typeof YRecipeShareSchema> {}

/**
 * Create recipe schema
 */
export const YCreateRecipeRequestSchema = object({
  name: string().required(),
  description: string().required(),
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
})
  .strict()
  .noUnknown();

export interface CreateRecipeRequestSchema extends InferType<typeof YCreateRecipeRequestSchema> {}

/**
 * Parse recipe schema
 */
export const YParseRecipeFromURLRequestSchema = object({
  source_url: string().required(),
})
  .strict()
  .noUnknown();

export interface ParseRecipeFromURLRequestSchema extends InferType<typeof YParseRecipeFromURLRequestSchema> {}

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
})
  .strict()
  .noUnknown();

export interface UpdateRecipeRequestSchema extends InferType<typeof YUpdateRecipeRequestSchema> {}

/**
 * List recipes schema
 */
export const YListRecipesQuerySchema = YListQuerySchema.shape({
  search: string().notRequired(),
  cookbook_id: number().notRequired(),
  cookbook_attachments: string().oneOf(["include", "exclude"]).notRequired(),
  shared_recipes: string().oneOf(["include", "exclude"]).notRequired().default("include"),
})
  .strict()
  .noUnknown();

export interface ListRecipesQuerySchema extends InferType<typeof YListRecipesQuerySchema> {}

export const YListRecipesResponseSchema = generateYListQuerySchema(YRecipeSchema);

export interface ListRecipesResponseSchema extends InferType<typeof YListRecipesResponseSchema> {}

/**
 * Fork Recipes Schema
 */
export const YForkRecipeRequestSchema = object({
  original_recipe_id: number().required(),
})
  .strict()
  .noUnknown();

export interface ForkRecipeRequestSchema extends InferType<typeof YForkRecipeRequestSchema> {}

/**
 * Create Recipe Share
 */
export const YCreateRecipeShareRequestSchema = object({
  user_kitchen_membership_id: number().required(),
  recipe_id: number().required(),
})
  .strict()
  .noUnknown();

export interface CreateRecipeShareRequestSchema extends InferType<typeof YCreateRecipeShareRequestSchema> {}

/**
 * List Recipe Shares
 */
export const YListRecipeSharesQuerySchema = YListQuerySchema.shape({
  targeting_self: boolean().notRequired(),
  from_self: boolean().notRequired(),
})
  .test("onlyOneOfTargetingSelfOrFromSelf", "Must specify only one of targeting_self or from_self", (ctx) => {
    return !ctx.from_self || !ctx.targeting_self;
  })
  .strict()
  .noUnknown();

export interface ListRecipeSharesQuerySchema extends InferType<typeof YListRecipeSharesQuerySchema> {}

export const YListRecipeSharesResponseSchema = generateYListQuerySchema(
  YRecipeShareSchema.shape({
    recipe: object({
      id: number().required(),
      name: string().required(),
    }).required(),
    user_kitchen_membership: YUserKitchenMembershipSchema.required(),
  })
)
  .strict()
  .noUnknown();

export interface ListRecipeSharesResponseSchema extends InferType<typeof YListRecipeSharesResponseSchema> {}
