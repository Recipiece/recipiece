import convert, { Unit as ConvertUnit } from "convert-units";
import Fraction from "fraction.js";
import { ALL_UNITS, MASS_UNITS, VOLUME_UNITS } from "./catalog";
import { ConvertableIngredient, ConvertableKnownIngredient, UnitConverter } from "./type";

/**
 * Returns a list of all the UnitConverters that are in the same category as the provided ingredient.
 * If no match is found throws an error.
 * If the ingredient has no units, throws an error.
 *
 * @param ingredient the ingredient to match on
 * @returns the list of UnitConverters in the same category, or undefined
 * @throws {Error}
 */
export const getSameCategoryUnits = (ingredient: ConvertableIngredient): typeof MASS_UNITS | typeof VOLUME_UNITS => {
  if (ingredient.unit) {
    const matchingMass = MASS_UNITS.find((unit) => {
      return unit.match_on.includes(ingredient.unit!.toLowerCase().trim());
    });
    if (matchingMass) {
      return [...MASS_UNITS];
    }

    const matchingVol = VOLUME_UNITS.find((unit) => {
      return unit.match_on.includes(ingredient.unit!.toLowerCase().trim());
    });
    if (matchingVol) {
      return [...VOLUME_UNITS];
    }

    throw new Error(`unable to find match for unit ${ingredient.unit}`);
  }
  throw new Error("provided ingredient has no units");
};

/**
 * Returns the UnitConverter matching this ingredient's unit.
 * If the ingredient has no unit, throws an error.
 * If the ingredient does not match on any know units, throws an error
 *
 * @param ingredient the ingredient to match on
 * @returns the matching UnitConverter
 * @throws {Error}
 */
export const getMatchingUnitConverter = (ingredient: ConvertableIngredient): UnitConverter => {
  if (ingredient.unit) {
    const matchingMass = MASS_UNITS.find((unit) => {
      return unit.match_on.includes(ingredient.unit!.toLowerCase().trim());
    });
    if (matchingMass) {
      return { ...matchingMass };
    }

    const matchingVol = VOLUME_UNITS.find((unit) => {
      return unit.match_on.includes(ingredient.unit!.toLowerCase().trim());
    });
    if (matchingVol) {
      return { ...matchingVol };
    }

    throw new Error(`unable to match ingredient with unit ${ingredient.unit}`);
  }
  throw new Error("ingredient does not have a unit");
};

/**
 * Converts an ingredient to another unit in the same category.
 * If the conversion succeeded, returns the numerical value.
 * If the ingredient does not have an amount, throws an error.
 * If the ingredient's amount could not be parsed using fraction, throws an error.
 * If the target unit is not in the same category as the ingredient's current unit, throws an error.
 * If a mathematical issue occurred while converting, throws an error.
 *
 * @param ingredient the ingredient to convert
 * @param targetUnit the unit to convert it to
 * @returns the converted amount
 * @throws {Error}
 */
export const convertIngredientInSameCategory = (ingredient: ConvertableIngredient, targetUnit: ConvertUnit): number => {
  if (!ingredient.amount) {
    throw new Error("ingredient does not have an amount");
  }

  const fractionalAmount = new Fraction(ingredient.amount);

  const matchingDesiredConverter = ALL_UNITS.find((unitDef) => {
    return unitDef.convert_symbol === targetUnit;
  })!;

  const matchingCurrentConverter = getMatchingUnitConverter(ingredient);
  if (matchingDesiredConverter.unit_category !== matchingCurrentConverter.unit_category) {
    throw new Error(
      `ingredient has unit ${ingredient.unit} which has type ${matchingCurrentConverter.unit_category}, but conversion is trying to take it to ${matchingDesiredConverter.unit_category}`
    );
  }

  return convert(fractionalAmount.valueOf()).from(matchingCurrentConverter.convert_symbol).to(matchingDesiredConverter.convert_symbol);
};

/**
 * Converts an ingredient across unit types, including "unitless" ingredients.
 * Uses the provided KnownIngredient to attempt walking across the units.
 * If the ingredient is already in the same category, it will still be converted using the basic conversion.
 *
 * @param ingredient the ingredient to convert
 * @param knownIngredient the KnownIngredient that allows conversion between weight, volume, and unitless
 * @param targetUnit the desired output unit
 * @returns the numeric value of the conversion
 * @throws {Error}
 */
export const convertIngredientInDifferentCategory = (ingredient: ConvertableIngredient, knownIngredient: ConvertableKnownIngredient, targetUnit: ConvertUnit): number => {
  const ingredientUnit = (ingredient.unit ?? "unitless").toLowerCase().trim();
  const ingredientAmount = new Fraction(ingredient.amount!).valueOf();

  const matchingDesiredConverter = ALL_UNITS.find((unitDef) => {
    return unitDef.convert_symbol === targetUnit;
  })!;

  const convertUnitlessIngredient = (): number => {
    let fromValue: number;
    let fromUnit: ConvertUnit = matchingDesiredConverter.unit_category === "mass" ? "g" : "cup";
    if (matchingDesiredConverter.unit_category === "mass") {
      fromValue = knownIngredient.unitless_amount! * (knownIngredient.grams * ingredientAmount);
    } else {
      fromValue = knownIngredient.unitless_amount! * (knownIngredient.us_cups * ingredientAmount);
    }
    return convert(fromValue).from(fromUnit).to(matchingDesiredConverter.convert_symbol);
  };

  const convertIngredient = (): number => {
    const matchingCurrentConverter = getMatchingUnitConverter(ingredient);

    if (matchingCurrentConverter.unit_category === matchingDesiredConverter.unit_category) {
      return convertIngredientInSameCategory(ingredient, targetUnit);
    } else {
      let fromValue = ingredientAmount;
      let fromUnit: ConvertUnit = matchingCurrentConverter.unit_category === "mass" ? "cup" : "g";
      if (matchingCurrentConverter.unit_category === "mass") {
        fromValue = convert(ingredientAmount).from(matchingCurrentConverter.convert_symbol).to("g");
        fromValue = (knownIngredient.us_cups / knownIngredient.grams) * fromValue;
        fromUnit = "cup";
      } else if (matchingCurrentConverter.unit_category === "volume") {
        fromValue = convert(ingredientAmount).from(matchingCurrentConverter.convert_symbol).to("cup");
        fromValue = (knownIngredient.grams / knownIngredient.us_cups) * fromValue;
        fromUnit = "g";
      }
      return convert(fromValue).from(fromUnit).to(matchingDesiredConverter.convert_symbol);
    }
  };

  if (ingredientUnit === "unitless") {
    return convertUnitlessIngredient();
  } else {
    return convertIngredient();
  }
};
