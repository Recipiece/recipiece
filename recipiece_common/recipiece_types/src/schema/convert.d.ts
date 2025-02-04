import { InferType } from "yup";
export declare const YConvertIngredientRequestSchema: import("yup").ObjectSchema<{
    ingredient_name: string;
    current_amount: string;
    current_unit: string | null | undefined;
}, import("yup").AnyObject, {
    ingredient_name: undefined;
    current_amount: undefined;
    current_unit: undefined;
}, "">;
export interface ConvertIngredientRequestSchema extends InferType<typeof YConvertIngredientRequestSchema> {
}
export declare const YConvertIngredientResponseSchema: import("yup").ObjectSchema<{
    ingredient_name: string;
    current_amount: string;
    current_unit: string | null | undefined;
    conversions: {
        unit?: import("yup").Maybe<string | undefined>;
        amount?: import("yup").Maybe<string | undefined>;
    }[] | undefined;
}, import("yup").AnyObject, {
    ingredient_name: undefined;
    current_amount: undefined;
    current_unit: undefined;
    conversions: undefined;
}, "">;
//# sourceMappingURL=convert.d.ts.map