import { array, boolean, date, InferType, number, object, string } from "yup";
import { generateYListQueryResponseSchema, YListQuerySchema } from "./list";
import { YUserKitchenMembershipSchema } from "./user";

export const YCookbookShareSchema = object({
  id: number().required(),
  created_at: date().required(),
  cookbook_id: number().required(),
  user_kitchen_membership_id: number().required(),
})
  .strict()
  .noUnknown();

export interface CookbookShareSchema extends InferType<typeof YCookbookShareSchema> {}

export const YCookbookSchema = object({
  id: number().required(),
  user_id: number().required(),
  name: string().required(),
  description: string().notRequired(),
  created_at: date().required(),
  shares: array(YCookbookShareSchema).notRequired(),
}).noUnknown();

export interface CookbookSchema extends InferType<typeof YCookbookSchema> {}

/**
 * Create cookbook schema
 */
export const YCreateCookbookRequestSchema = object({
  name: string().required(),
  description: string().notRequired(),
})
  .strict()
  .noUnknown();

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
  recipe_id: number().notRequired(),
  recipe_id_filter: string().oneOf(["include", "exclude"]).notRequired(),
  search: string().notRequired(),
  shared_cookbooks_filter: string().oneOf(["include", "exclude"]).notRequired(),
})
  .transform((val) => {
    return {
      ...val,
      shared_cookbooks_filter: val.shared_cookbooks_filter ?? "include",
    };
  })
  .noUnknown();

export interface ListCookbooksQuerySchema extends InferType<typeof YListCookbooksQuerySchema> {}

export const YListCookbooksResponseSchema = generateYListQueryResponseSchema(YCookbookSchema);

export interface ListCookbooksResponseSchema extends InferType<typeof YListCookbooksResponseSchema> {}

/**
 * Create Cookbook Share
 */
export const YCreateCookbookShareRequestSchema = object({
  user_kitchen_membership_id: number().required(),
  cookbook_id: number().required(),
}).noUnknown();

export interface CreateCookbookShareRequestSchema extends InferType<typeof YCreateCookbookShareRequestSchema> {}

/**
 * List Cookbook Shares
 */
export const YListCookbookSharesQuerySchema = YListQuerySchema.shape({
  targeting_self: boolean().notRequired(),
  from_self: boolean().notRequired(),
  user_kitchen_membership_id: number().notRequired(),
})
  .test("onlyOneOfTargetingSelfOrFromSelf", "Must specify only one of targeting_self or from_self", (ctx) => {
    return !ctx.from_self || !ctx.targeting_self;
  })
  .noUnknown();

export interface ListCookbookSharesQuerySchema extends InferType<typeof YListCookbookSharesQuerySchema> {}

export const YListCookbookSharesResponseSchema = generateYListQueryResponseSchema(
  YCookbookShareSchema.shape({
    cookbook: object({
      id: number().required(),
      name: string().required(),
    }).required(),
    user_kitchen_membership: YUserKitchenMembershipSchema.required(),
  })
).noUnknown();

export interface ListCookbookSharesResponseSchema extends InferType<typeof YListCookbookSharesResponseSchema> {}
