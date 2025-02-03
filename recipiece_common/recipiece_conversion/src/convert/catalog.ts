import { UnitConverter } from "./type";

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
