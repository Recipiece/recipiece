import { KnownIngredientSchema, RecipeIngredientSchema } from "@recipiece/types";
import { Unit as ConvertUnit } from "convert-units";

export type ConvertableIngredient = Omit<RecipeIngredientSchema, "id" | "created_at" | "order" | "recipe_id">;
export type ConvertableKnownIngredient = Omit<KnownIngredientSchema, "id" | "created_at">;

export interface UnitConverter {
  readonly convert_symbol: ConvertUnit;
  readonly display_name: {
    readonly singular: string;
    readonly plural: string;
  };
  readonly match_on: string[];
  readonly unit_category: "mass" | "volume";
}
