import { array, boolean, date, InferType, number, object, string } from "yup";
import { generateYListQueryResponseSchema, YListQuerySchema } from "./list";
import { YRecipeSchema } from "./recipe";
import { YUserKitchenMembershipSchema } from "./user";

export const YMealPlanShareSchema = object({
  id: number().required(),
  created_at: date().required(),
  meal_plan_id: number().required(),
  user_kitchen_membership_id: number().required(),
});

export const YMealPlanItemSchema = object({
  id: number().required(),
  created_at: date().required(),
  meal_plan_id: number().required(),
  start_date: date().required(),
  freeform_content: string().notRequired(),
  notes: string().notRequired(),
  recipe_id: number().notRequired(),
  recipe: YRecipeSchema.notRequired(),
}).noUnknown();

export const YMealPlanConfigurationSchema = object({
  generation: object({
    excluded_ingredients: array(string()).notRequired(),
  }).notRequired(),
  general: object({
    treat_times_as: string().oneOf(["begin_at", "finish_at"]).notRequired(),
    send_recipe_notification: boolean().notRequired(),
  }).notRequired(),
  meats: object({
    preferred_thawing_method: string().oneOf(["refrigerator", "cold_water", "microwave"]).notRequired(),
    send_thawing_notification: boolean().notRequired(),
  }).notRequired(),
})
  .strict()
  .noUnknown();

export interface MealPlanShareSchema extends InferType<typeof YMealPlanShareSchema> {}

export interface MealPlanConfigurationSchema extends InferType<typeof YMealPlanConfigurationSchema> {}

export interface MealPlanItemSchema extends InferType<typeof YMealPlanItemSchema> {}

export const YMealPlanSchema = object({
  id: number().required(),
  name: string().required(),
  user_id: number().required(),
  created_at: date().required(),
  configuration: YMealPlanConfigurationSchema.notRequired(),
  shares: array(YMealPlanShareSchema).notRequired(),
}).noUnknown();

export interface MealPlanSchema extends InferType<typeof YMealPlanSchema> {}

/**
 * Create meal plan
 */
export const YCreateMealPlanRequestSchema = object({
  name: string().required(),
}).noUnknown();

export interface CreateMealPlanRequestSchema extends InferType<typeof YCreateMealPlanRequestSchema> {}

/**
 * Update meal plan
 */
export const YUpdateMealPlanRequestSchema = object({
  id: number().required(),
  name: string().notRequired(),
}).noUnknown();

export interface UpdateMealPlanRequestSchema extends InferType<typeof YUpdateMealPlanRequestSchema> {}

/**
 * List meal plans
 */
export const YListMealPlansQuerySchema = YListQuerySchema.shape({
  shared_meal_plans_filter: string().oneOf(["include", "exclude"]).notRequired(),
})
  .transform((val) => {
    return {
      ...val,
      shared_meal_plans_filter: val.shared_meal_plans_filter ?? "include",
    };
  })
  .noUnknown();

export interface ListMealPlansQuerySchema extends InferType<typeof YListMealPlansQuerySchema> {}

export const YListMealPlansResponseSchema = generateYListQueryResponseSchema(YMealPlanSchema);

export interface ListMealPlansResponseSchema extends InferType<typeof YListMealPlansResponseSchema> {}

/**
 * List items for meal plan
 */
export const YListItemsForMealPlanQuerySchema = YListQuerySchema.shape({
  start_date: string().datetime().notRequired(),
  end_date: string().datetime().notRequired(),
}).noUnknown();

export interface ListItemsForMealPlanQuerySchema extends InferType<typeof YListItemsForMealPlanQuerySchema> {}

export const YListItemsForMealPlanResponseSchema = generateYListQueryResponseSchema(YMealPlanItemSchema);

export interface ListItemsForMealPlanResponseSchema extends InferType<typeof YListItemsForMealPlanResponseSchema> {}

/**
 * Create meal plan item
 */
export const YCreateMealPlanItemRequestSchema = object({
  meal_plan_id: number().required(),
  start_date: string().datetime().required(),
  freeform_content: string().notRequired().nullable(),
  notes: string().notRequired().nullable(),
  recipe_id: number().notRequired().nullable(),
})
  .test("oneOfFreeformContentOrRecipeId", (ctx) => {
    return ctx.freeform_content !== undefined || !!ctx.recipe_id;
  })
  .noUnknown();

export interface CreateMealPlanItemRequestSchema extends InferType<typeof YCreateMealPlanItemRequestSchema> {}

/**
 * Update meal plan item
 */
export const YUpdateMealPlanItemRequestSchema = object({
  id: number().required(),
  meal_plan_id: number().required(),
  start_date: string().datetime().notRequired(),
  freeform_content: string().notRequired().nullable(),
  notes: string().notRequired().nullable(),
  recipe_id: number().notRequired().nullable(),
}).noUnknown();

export interface UpdateMealPlanItemRequestSchema extends InferType<typeof YUpdateMealPlanItemRequestSchema> {}

/**
 * Meal Plan Configuration
 */
// export const YSetMealPlanConfigurationRequestSchema = object({
//   configuration: YMealPlanConfigurationSchema,
// });

// export interface SetMealPlanConfigurationRequestSchema extends InferType<typeof YSetMealPlanConfigurationRequestSchema> {}

/**
 * Bulk set items
 */
export const YBulkSetMealPlanItemsRequestSchema = object({
  create: array(YMealPlanItemSchema.omit(["id", "created_at", "recipe"])).required(),
  update: array(YMealPlanItemSchema.omit(["recipe"])).required(),
  delete: array(YMealPlanItemSchema.omit(["recipe"])).required(),
}).noUnknown();

export interface BulkSetMealPlanItemsRequestSchema extends InferType<typeof YBulkSetMealPlanItemsRequestSchema> {}

export const YBulkSetMealPlanItemsResponseSchema = object({
  created: array(YMealPlanItemSchema).required(),
  updated: array(YMealPlanItemSchema).required(),
}).noUnknown();

export interface BulkSetMealPlanItemsResponseSchema extends InferType<typeof YBulkSetMealPlanItemsResponseSchema> {}

/**
 * Create Meal Plan Share
 */
export const YCreateMealPlanShareRequestSchema = object({
  user_kitchen_membership_id: number().required(),
  meal_plan_id: number().required(),
}).noUnknown();

export interface CreateMealPlanShareRequestSchema extends InferType<typeof YCreateMealPlanShareRequestSchema> {}

/**
 * List MealPlan Shares
 */
export const YListMealPlanSharesQuerySchema = YListQuerySchema.shape({
  targeting_self: boolean().notRequired(),
  from_self: boolean().notRequired(),
  user_kitchen_membership_id: number().notRequired(),
})
  .test("onlyOneOfTargetingSelfOrFromSelf", "Must specify only one of targeting_self or from_self", (ctx) => {
    return !ctx.from_self || !ctx.targeting_self;
  })
  .noUnknown();

export interface ListMealPlanSharesQuerySchema extends InferType<typeof YListMealPlanSharesQuerySchema> {}

export const YListMealPlanSharesResponseSchema = generateYListQueryResponseSchema(
  YMealPlanShareSchema.shape({
    meal_plan: object({
      id: number().required(),
      name: string().required(),
    }).required(),
    user_kitchen_membership: YUserKitchenMembershipSchema.required(),
  })
).noUnknown();

export interface ListMealPlanSharesResponseSchema extends InferType<typeof YListMealPlanSharesResponseSchema> {}
