import { Unit as ConvertUnit } from "convert-units";
export interface ConvertableIngredient {
  readonly name: string;
  readonly amount?: string;
  readonly unit?: string;
}
export interface ConvertableKnownIngredient {
  readonly ingredient_name: string;
  readonly grams: number;
  readonly us_cups: number;
  readonly unitless_amount?: number;
  readonly preferred_measure?: string;
}

export interface UnitConverter {
  readonly convert_symbol: ConvertUnit;
  readonly display_name: {
    readonly singular: string;
    readonly plural: string;
  };
  readonly match_on: string[];
  readonly unit_category: "mass" | "volume";
}
