import { array, boolean, InferType, number, object, string } from "yup";

export const YRecipeIngredientSchema = object({
  id: number().required(),
  recipe_id: number().required(),
  name: string().required(),
  unit: string().notRequired(),
  amount: string().notRequired(),
  order: number().required(),
}).strict().noUnknown();

export const YRecipeStepSchema = object({
  id: number().required(),
  recipe_id: number().required(),
  order: number().required(),
  content: string().required(),
}).strict().noUnknown();

export const YRecipeSchema = object({
  id: number().required(),
  user_id: number().required(),
  name: string().required(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
  ingredients: array().of(YRecipeIngredientSchema).notRequired(),
  steps: array().of(YRecipeStepSchema).notRequired(),
}).strict().noUnknown();

export interface RecipeSchema extends InferType<typeof YRecipeSchema> {}

export interface RecipeIngredientSchema extends InferType<typeof YRecipeIngredientSchema> {}

export interface RecipeStepSchema extends InferType<typeof YRecipeStepSchema> {}

/**
 * Create recipe schema
 */
export const YCreateRecipeSchema = object({
  name: string().required(),
  description: string().required(),
  private: boolean().notRequired().default(false),
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
}).strict().noUnknown();

export interface CreateRecipeSchema extends InferType<typeof YCreateRecipeSchema> {}

/**
 * Update recipe schema
 */
export const YUpdateRecipeSchema = object({
  id: number().required(),
  name: string().notRequired(),
  description: string().notRequired(),
  private: boolean().notRequired().default(false),
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
}).strict().noUnknown();

export interface UpdateRecipeSchema extends InferType<typeof YUpdateRecipeSchema> {}
