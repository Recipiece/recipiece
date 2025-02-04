import { InferType } from "yup";
export declare const YKnownIngredientSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    ingredient_name: string;
    grams: number;
    us_cups: number;
    unitless_amount: number | null;
    preferred_measure: string | null;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    ingredient_name: undefined;
    grams: undefined;
    us_cups: undefined;
    unitless_amount: null;
    preferred_measure: null;
}, "">;
export interface KnownIngredientSchema extends InferType<typeof YKnownIngredientSchema> {
}
/**
 * List known ingredients
 */
export declare const YListKnownIngredientsResponseSchema: import("yup").ObjectSchema<{
    data: {
        grams: number;
        id: number;
        created_at: Date;
        ingredient_name: string;
        us_cups: number;
        unitless_amount: number | null;
        preferred_measure: string | null;
    }[] | undefined;
}, import("yup").AnyObject, {
    data: undefined;
}, "">;
export interface ListKnownIngredientsResponseSchema extends InferType<typeof YListKnownIngredientsResponseSchema> {
}
//# sourceMappingURL=knownIngredient.d.ts.map