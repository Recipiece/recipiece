import { array, date, InferType, number, object, string } from "yup";

export const YKnownIngredientSchema = object({
  id: number().required(),
  created_at: date().required(),
  ingredient_name: string().required(),
  grams: number().required(),
  us_cups: number().required(),
  unitless_amount: number().notRequired().default(null),
  preferred_measure: string().notRequired().default(null),
})
  .strict()
  .noUnknown();

export interface KnownIngredientSchema extends InferType<typeof YKnownIngredientSchema> {}

/**
 * List known ingredients
 */
export const YListKnownIngredientsResponseSchema = object({
  data: array(YKnownIngredientSchema),
});

export interface ListKnownIngredientsResponseSchema extends InferType<typeof YListKnownIngredientsResponseSchema> {}
