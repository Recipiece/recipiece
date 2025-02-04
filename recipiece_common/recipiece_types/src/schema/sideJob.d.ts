import { InferType } from "yup";
export declare const YSideJobSchema: import("yup").ObjectSchema<{
    id: string;
    created_at: Date;
    user_id: number;
    job_data: {};
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    user_id: undefined;
    job_data: {};
}, "">;
export interface SideJobSchema extends InferType<typeof YSideJobSchema> {
}
/**
 * Meal Plan Configuration Job
 */
export declare const YMealPlanConfigurationJobDataSchema: import("yup").ObjectSchema<{
    meal_plan_id: number;
}, import("yup").AnyObject, {
    meal_plan_id: undefined;
}, "">;
export interface MealPlanConfigurationJobDataSchema extends InferType<typeof YMealPlanConfigurationJobDataSchema> {
}
/**
 * Meal Plan Item Job
 */
export declare const YMealPlanItemJobDataSchema: import("yup").ObjectSchema<{
    meal_plan_id: number;
    meal_plan_item_id: number;
}, import("yup").AnyObject, {
    meal_plan_id: undefined;
    meal_plan_item_id: undefined;
}, "">;
export interface MealPlanItemJobDataSchema extends InferType<typeof YMealPlanItemJobDataSchema> {
}
/**
 * Meal Plan Notification Job
 */
export declare const YMealPlanNotificationJobDataSchema: import("yup").ObjectSchema<{
    meal_plan_id: number;
    meal_plan_item_id: number;
    ingredient_name: string;
    ingredient_amount: import("yup").Maybe<string | undefined>;
    ingredient_unit: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    meal_plan_id: undefined;
    meal_plan_item_id: undefined;
    ingredient_name: undefined;
    ingredient_amount: undefined;
    ingredient_unit: undefined;
}, "">;
export interface MealPlanNotificationJobDataSchema extends InferType<typeof YMealPlanNotificationJobDataSchema> {
}
/**
 * Recipe Import Job
 */
export declare const YRecipeImportJobDataSchema: import("yup").ObjectSchema<{
    file_name: string;
    source: string;
}, import("yup").AnyObject, {
    file_name: undefined;
    source: undefined;
}, "">;
export interface RecipeImportJobDataSchema extends InferType<typeof YRecipeImportJobDataSchema> {
}
//# sourceMappingURL=sideJob.d.ts.map