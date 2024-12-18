import { array, boolean, date, InferType, number, object, string } from "yup";
import { YRecipeSchema } from "./recipe";
import { generateYListQuerySchema, YListQuerySchema } from "./list";

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
})
  .strict()
  .noUnknown();

export interface MealPlanItemSchema extends InferType<typeof YMealPlanItemSchema> {}

export const YMealPlanSchema = object({
  id: number().required(),
  name: string().required(),
  created_at: date().required(),
})
  .strict()
  .noUnknown();

export interface MealPlanSchema extends InferType<typeof YMealPlanSchema> {}

/**
 * Create meal plan
 */
export const YCreateMealPlanRequestSchema = object({
  name: string().required(),
})
  .strict()
  .noUnknown();

export interface CreateMealPlanRequestSchema extends InferType<typeof YCreateMealPlanRequestSchema> {}

/**
 * Update meal plan
 */
export const YUpdateMealPlanRequestSchema = object({
  id: number().required(),
  name: string().notRequired(),
})
  .strict()
  .noUnknown();

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
export const YListItemsForMealPlanQuerySchema = object({
  start_date: string().datetime().notRequired(),
  end_date: string().datetime().notRequired(),
})
  .strict()
  .noUnknown();

export interface ListItemsForMealPlanQuerySchema extends InferType<typeof YListItemsForMealPlanQuerySchema> {}

export const YListItemsForMealPlanResponseSchema = object({
  meal_plan_items: array(YMealPlanItemSchema),
});

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
  .strict()
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
})
  .strict()
  .noUnknown();

export interface UpdateMealPlanItemRequestSchema extends InferType<typeof YUpdateMealPlanItemRequestSchema> {}
