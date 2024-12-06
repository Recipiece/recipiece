import { array, date, InferType, number, object, string } from "yup";
import { YRecipeSchema } from "./recipe";

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
  recipes: array(
    object({
      id: number().required(),
      recipe_scale: number().required(),
      duration_ms: number().required().positive(),
      order: number().required(),
    })
  ).required(),
})
  .strict()
  .noUnknown();

export interface CreateMealPlanSchema extends InferType<typeof YCreateMealPlanRequestSchema> {}

export const YCreateMealPlanResponseSchema = object({
  id: number().required(),
  name: string().required(),
  created_at: date().required(),
  recipes: array(
    YRecipeSchema.shape({
      recipe_scale: number().required(),
      duration_ms: number().required().positive(),
      order: number().required(),
    }),
  ).required(),
});

export interface CreateMealPlanResponseSchema extends InferType<typeof YCreateMealPlanResponseSchema> {}

