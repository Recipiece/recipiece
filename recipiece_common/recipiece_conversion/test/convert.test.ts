import convert from "convert-units";
import { ConvertableIngredient, ConvertableKnownIngredient, convertIngredientInDifferentCategory, convertIngredientInSameCategory } from "../src";

describe("Convert Ingredients", () => {
  describe("in the same unit category", () => {
    it("should convert a decimal ingredient", () => {
      const ingredient: ConvertableIngredient = {
        name: "test",
        unit: "grams",
        amount: "9999.99",
      }
      const result = convertIngredientInSameCategory(ingredient, "kg");
      expect(result).toBeCloseTo(9.999);
    });

    it("should convert a fractional ingredient", () => {
      const ingredient: ConvertableIngredient = {
        name: "test",
        unit: "cup",
        amount: "1/2",
      }
      const result = convertIngredientInSameCategory(ingredient, "tsp");
      expect(result).toBeCloseTo(24);
    });

    it("should throw an error if the unit is not defined", () => {
      const ingredient: ConvertableIngredient = {
        name: "test",
        amount: "1/2",
      }
      expect(() => convertIngredientInSameCategory(ingredient, "cup")).toThrow();
    });

    it("should throw an error if the target unit cannot be matched", () => {
      const ingredient: ConvertableIngredient = {
        name: "test",
        unit: "cup",
        amount: "1/2",
      }
      expect(() => convertIngredientInSameCategory(ingredient, "GVA")).toThrow();
    });

    it("should throw an error if the ingredient unit cannot be matched", () => {
      const ingredient: ConvertableIngredient = {
        name: "test",
        unit: "KPa",
        amount: "1/2",
      }
      expect(() => convertIngredientInSameCategory(ingredient, "cup")).toThrow();
    });

    it("should convert a unit to itself", () => {
      const ingredient: ConvertableIngredient = {
        name: "test",
        unit: "cup",
        amount: "1/2",
      }
      const result = convertIngredientInSameCategory(ingredient, "cup");
      expect(result).toBeCloseTo(0.5);
    })
  });

  describe("in a different unit category", () => {
    it("should convert the an ingredient in another unit space", () => {
      // 1lb of flour is ~ 3.6 cups
      const initialFlourAmount = 2.4;

      const ingredient: ConvertableIngredient = {
        name: "flour",
        unit: "lb",
        amount: initialFlourAmount.toString(),
      }
      const knownIngredient: ConvertableKnownIngredient = {
        grams: 120,
        us_cups: 1,
        ingredient_name: "flour",
        unitless_amount: null,
        preferred_measure: null,
      }
      const result = convertIngredientInDifferentCategory(ingredient, knownIngredient, "Tbs");
      const flourAmountInGrams = convert(initialFlourAmount).from("lb").to("g");
      const flourAmountInCups = flourAmountInGrams / knownIngredient.grams;
      const expectedFlourAmount = convert(flourAmountInCups).from("cup").to("Tbs");
      expect(result).toBeCloseTo(expectedFlourAmount);
    });

    it("should convert an ingredient in the same unit space", () => {
      const ingredient: ConvertableIngredient = {
        name: "flour",
        unit: "Tbsp",
        amount: "11 1/3",
      }
      const knownIngredient: ConvertableKnownIngredient = {
        grams: 120,
        us_cups: 1,
        ingredient_name: "flour",
        unitless_amount: null,
        preferred_measure: null,
      }
      const result = convertIngredientInDifferentCategory(ingredient, knownIngredient, "l");
      const expectedAmount = convert(11.3333).from("Tbs").to("l");
      expect(result).toBeCloseTo(expectedAmount);
    });

    it("should convert a unitless ingredient", () => {
      const ingredient: ConvertableIngredient = {
        name: "egg",
        amount: "11",
      }
      const knownIngredient: ConvertableKnownIngredient = {
        grams: 120,
        us_cups: 1,
        ingredient_name: "egg",
        unitless_amount: 50,
        preferred_measure: null,
      }
      const result = convertIngredientInDifferentCategory(ingredient, knownIngredient, "pnt");
      const eggsInCups = knownIngredient.unitless_amount! / 11;
      const eggsInPints = convert(eggsInCups).from("cup").to("pnt");
      expect(result).toBeCloseTo(eggsInPints);
    });
  });
});
