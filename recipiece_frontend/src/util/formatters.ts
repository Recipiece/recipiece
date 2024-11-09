import Fraction from 'fraction.js';

export function isDecimal(value: string) {
  if (isNaN(parseFloat(value))) {
    return false;
  }

  return value.includes(".");
}

export function formatIngredientAmount(value: string): string {
  if(isDecimal(value)) {
    // if the value is coming across like 1.5 or 0.75 then lets make it a fractional value
    const decimalValue = parseFloat(value);
    return new Fraction(decimalValue).simplify(0.1).toFraction(true);
  } else {
    // if it's not a decimal, just send the value back
    return value;
  }
}
