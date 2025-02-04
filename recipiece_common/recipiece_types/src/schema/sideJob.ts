import { date, InferType, number, object, string } from "yup";

export const YSideJobSchema = object({
  id: string().uuid().required(),
  created_at: date().required(),
  user_id: number().required(),
  job_data: object().required(),
}).noUnknown();

export interface SideJobSchema extends InferType<typeof YSideJobSchema> {}

/**
 * Meal Plan Configuration Job
 */
export const YMealPlanConfigurationJobDataSchema = object({
  meal_plan_id: number().required(),
});

export interface MealPlanConfigurationJobDataSchema extends InferType<typeof YMealPlanConfigurationJobDataSchema> {}

/**
 * Meal Plan Item Job
 */
export const YMealPlanItemJobDataSchema = object({
  meal_plan_id: number().required(),
  meal_plan_item_id: number().required(),
}).noUnknown();

export interface MealPlanItemJobDataSchema extends InferType<typeof YMealPlanItemJobDataSchema> {}

/**
 * Meal Plan Notification Job
 */
export const YMealPlanNotificationJobDataSchema = object({
  meal_plan_id: number().required(),
  meal_plan_item_id: number().required(),
  ingredient_name: string().required(),
  ingredient_amount: string().notRequired(),
  ingredient_unit: string().notRequired(),
}).noUnknown();

export interface MealPlanNotificationJobDataSchema extends InferType<typeof YMealPlanNotificationJobDataSchema> {}

/**
 * Recipe Import Job
 */
export const YRecipeImportJobDataSchema = object({
  file_name: string().required(),
  source: string().required(),
});

export interface RecipeImportJobDataSchema extends InferType<typeof YRecipeImportJobDataSchema> {}
