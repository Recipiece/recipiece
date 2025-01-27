import { array, boolean, date, InferType, number, object, string } from "yup";
import { generateYListQuerySchema, YListQuerySchema } from "./list";
import { YRecipeSchema } from "./recipe";

export const YMealPlanItemSchema = object({
  id: number().required(),
  created_at: date().required(),
  meal_plan_id: number().required(),
  start_date: date().required(),
  freeform_content: string().notRequired().nullable(),
  notes: string().notRequired().nullable(),
  recipe_id: number().notRequired().nullable(),
  recipe: YRecipeSchema.notRequired().nullable(),
  label: string().notRequired().nullable(),
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
}).strict().noUnknown();

export interface MealPlanConfigurationSchema extends InferType<typeof YMealPlanConfigurationSchema> {}

export interface MealPlanItemSchema extends InferType<typeof YMealPlanItemSchema> {}

export const YMealPlanSchema = object({
  id: number().required(),
  name: string().required(),
  user_id: number().required(),
  created_at: date().required(),
  configuration: YMealPlanConfigurationSchema.notRequired(),
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
export const YListMealPlanQuerySchema = YListQuerySchema.shape({});

export interface ListMealPlanQuerySchema extends InferType<typeof YListMealPlanQuerySchema> {}

export const YListMealPlanResponseSchema = generateYListQuerySchema(YMealPlanSchema);

export interface ListMealPlanResponseSchema extends InferType<typeof YListMealPlanResponseSchema> {}

/**
 * List items for meal plan
 */
export const YListItemsForMealPlanQuerySchema = YListQuerySchema.shape({
  start_date: string().datetime().notRequired(),
  end_date: string().datetime().notRequired(),
}).noUnknown();

export interface ListItemsForMealPlanQuerySchema extends InferType<typeof YListItemsForMealPlanQuerySchema> {}

export const YListItemsForMealPlanResponseSchema = generateYListQuerySchema(YMealPlanItemSchema);

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
  label: string().notRequired().nullable(),
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
  label: string().notRequired().nullable(),
}).noUnknown();

export interface UpdateMealPlanItemRequestSchema extends InferType<typeof YUpdateMealPlanItemRequestSchema> {}

/**
 * Request meal plan session
 */
export const YRequestMealPlanSessionResponseSchema = object({
  token: string().uuid().required(),
}).noUnknown();

export interface RequestMealPlanSessionResponseSchema extends InferType<typeof YRequestMealPlanSessionResponseSchema> {}

/**
 * Modify meal plan
 */
const MODIFY_MEAL_PLAN_ACTIONS = ["current_items", "add_item", "delete_item", "set_session_upper_bound", "set_session_lower_bound", "__ping__"];

export const YModifyMealPlanMessage = object({
  action: string().oneOf([...MODIFY_MEAL_PLAN_ACTIONS]),
  item: object({
    start_date: date().required(),
    freeform_content: string().notRequired().nullable(),
    notes: string().notRequired().nullable(),
    recipe_id: number().notRequired().nullable(),
    label: string().notRequired().nullable(),
  })
    .notRequired()
    .default(undefined),
  start_date: date().required(),
  end_date: date().required(),
}).noUnknown();

export interface ModifyMealPlanMessageSchema extends InferType<typeof YModifyMealPlanMessage> {}

export const YModifyMealPlanResponse = object({
  responding_to_action: string().oneOf([...MODIFY_MEAL_PLAN_ACTIONS]),
  items: array(YMealPlanItemSchema).required(),
});

export interface ModifyMealPlanResponseSchema extends InferType<typeof YModifyMealPlanResponse> {}

/**
 * Meal Plan Configuration
 */
export const YSetMealPlanConfigurationRequestSchema = object({
  configuration: YMealPlanConfigurationSchema,
});

export interface SetMealPlanConfigurationRequestSchema extends InferType<typeof YSetMealPlanConfigurationRequestSchema> {}
