import { array, InferType, object, string } from "yup";

export const YConvertIngredientRequestSchema = object({
  ingredient_name: string().required(),
  current_amount: string().required(),
  current_unit: string().nullable(),
}).strict().noUnknown();

export interface ConvertIngredientRequestSchema extends InferType<typeof YConvertIngredientRequestSchema> {}

export const YConvertIngredientResponseSchema = object({
  ingredient_name: string().required(),
  current_amount: string().required(),
  current_unit: string().nullable(),
  conversions: array(object({
    unit: string().notRequired().nullable(),
    amount: string().notRequired().nullable(),
  }))
}).strict().noUnknown();
