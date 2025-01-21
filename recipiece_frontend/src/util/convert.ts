import { KnownIngredientSchema, RecipeIngredientSchema } from "@recipiece/types";
import convert, { Unit as ConvertUnit } from "convert-units";
import Fraction from "fraction.js";

interface UnitConverter {
  readonly convert_symbol: ConvertUnit;
  readonly display_name: {
    readonly singular: string;
    readonly plural: string;
  };
  readonly match_on: string[];
  readonly unit_category: "mass" | "volume";
}

export const MASS_UNITS: UnitConverter[] = [
  {
    convert_symbol: "g",
    display_name: {
      singular: "gram",
      plural: "grams",
    },
    match_on: ["g", "gram", "grm", "gs", "grams"],
    unit_category: "mass",
  },
  {
    convert_symbol: "kg",
    display_name: {
      singular: "kilogram",
      plural: "kilograms",
    },
    match_on: ["kg", "kilogram", "kgs"],
    unit_category: "mass",
  },
  {
    convert_symbol: "oz",
    display_name: {
      singular: "ounce",
      plural: "ounces",
    },
    match_on: ["oz", "ounce", "ounces", "ozs"],
    unit_category: "mass",
  },
  {
    convert_symbol: "lb",
    display_name: {
      singular: "pound",
      plural: "pounds",
    },
    match_on: ["lbs", "lb", "pound", "pounds", "pnds", "pnd"],
    unit_category: "mass",
  },
];

export const VOLUME_UNITS: UnitConverter[] = [
  {
    convert_symbol: "ml",
    display_name: {
      singular: "milliliter",
      plural: "milliliters",
    },
    match_on: ["ml", "mls", "milli", "millis", "milliliter", "millilitre", "milliliters", "millilitres"],
    unit_category: "volume",
  },
  {
    convert_symbol: "l",
    display_name: {
      singular: "liter",
      plural: "liters",
    },
    match_on: ["l", "ls", "liter", "litre", "liters", "litres"],
    unit_category: "volume",
  },
  {
    convert_symbol: "tsp",
    display_name: {
      singular: "teaspoon",
      plural: "teaspoons",
    },
    match_on: ["t", "tsp", "tsps", "teaspoon", "teaspoons"],
    unit_category: "volume",
  },
  {
    convert_symbol: "Tbs",
    display_name: {
      singular: "tablespoon",
      plural: "tablespoons",
    },
    match_on: ["tb", "tbs", "tbsp", "tbsps", "tablespoon", "tablespoons"],
    unit_category: "volume",
  },
  {
    convert_symbol: "fl-oz",
    display_name: {
      singular: "fluid ounce",
      plural: "fluid ounces",
    },
    match_on: ["floz", "fl-oz", "flozs", "fl-ozs", "fluid ounce", "fluid ounces", "fluid oz", "fluid ozs"],
    unit_category: "volume",
  },
  {
    convert_symbol: "cup",
    display_name: {
      singular: "cup",
      plural: "cups",
    },
    match_on: ["c", "cs", "cup", "cups", "cp", "cps", "us cup", "us cups"],
    unit_category: "volume",
  },
  {
    convert_symbol: "pnt",
    display_name: {
      singular: "pint",
      plural: "pints",
    },
    match_on: ["pt", "pint", "pts", "pints"],
    unit_category: "volume",
  },
  {
    convert_symbol: "qt",
    display_name: {
      singular: "quart",
      plural: "quarts",
    },
    match_on: ["qt", "qts", "quart", "quarts"],
    unit_category: "volume",
  },
  {
    convert_symbol: "gal",
    display_name: {
      singular: "gallon",
      plural: "gallons",
    },
    match_on: ["gal", "gals", "gallon", "gallons", "us gal", "us gallon", "us gals", "us gallons"],
    unit_category: "volume",
  },
];

export const ALL_UNITS = [...MASS_UNITS, ...VOLUME_UNITS];

export const convertIngredient = (ingredient: RecipeIngredientSchema, knownIngredient: KnownIngredientSchema, targetUnit: ConvertUnit): number | undefined => {
  const currentIngredientUnit = (ingredient.unit || "unitless").toLowerCase().trim();
  let convertingAmount = new Fraction(ingredient.amount!).valueOf();
  let baseKnownConvertUnit: ConvertUnit;

  const matchingDesiredConverter = ALL_UNITS.find((unitDef) => {
    return unitDef.convert_symbol === targetUnit;
  })!;

  const matchingCurrentConverter =
    currentIngredientUnit === "unitless"
      ? undefined
      : ALL_UNITS.find((unitDef) => {
          return unitDef.match_on.includes(currentIngredientUnit);
        })!;

  if (matchingCurrentConverter) {
    baseKnownConvertUnit = matchingCurrentConverter.convert_symbol;
  }

  if (currentIngredientUnit !== "unitless") {
    if (!matchingCurrentConverter) {
      return undefined;
    }

    if (matchingCurrentConverter!.convert_symbol === matchingDesiredConverter.convert_symbol) {
      return convertingAmount;
    }

    if (matchingCurrentConverter!.unit_category !== matchingDesiredConverter.unit_category) {
      /**
       * we have to convert across units, so take this ingredient to its corresponding base
       * unit in the known ingredient and translate it over to the other one
       */

      if (matchingCurrentConverter!.unit_category === "mass" && matchingCurrentConverter!.convert_symbol !== "g") {
        convertingAmount = convert(convertingAmount).from(matchingCurrentConverter!.convert_symbol).to("g");
      } else if (matchingCurrentConverter!.unit_category === "volume" && matchingCurrentConverter!.convert_symbol !== "cup") {
        convertingAmount = convert(convertingAmount).from(matchingCurrentConverter!.convert_symbol).to("cup");
      }

      if (matchingCurrentConverter!.unit_category === "mass") {
        convertingAmount = convertingAmount * (knownIngredient.us_cups / knownIngredient.grams);
        baseKnownConvertUnit = "cup";
      } else {
        convertingAmount = convertingAmount * (knownIngredient.grams / knownIngredient.us_cups);
        baseKnownConvertUnit = "g";
      }
    } else {
      /**
       * Just convert across directly
       */
      baseKnownConvertUnit = matchingCurrentConverter!.convert_symbol;
    }
  } else {
    /**
     * If we're dealing with a unitless amount, we'll need to always take it down to the base first
     * This is easier though, since we can always land in the unit category we want
     */
    if (matchingDesiredConverter.unit_category === "mass") {
      convertingAmount = knownIngredient.unitless_amount! * (knownIngredient.grams / convertingAmount);
      baseKnownConvertUnit = "g";
    } else {
      convertingAmount = knownIngredient.unitless_amount! * (knownIngredient.us_cups / convertingAmount);
      baseKnownConvertUnit = "cup";
    }
  }

  /**
   * Convert it up to the desired unit
   */
  convertingAmount = convert(convertingAmount).from(baseKnownConvertUnit).to(matchingDesiredConverter.convert_symbol);
  return convertingAmount;
};
