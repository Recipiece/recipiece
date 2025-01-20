import { TimerSchema } from "@recipiece/types";
import Fraction from "fraction.js";
import { DateTime } from "luxon";

export function isDecimal(value: string) {
  if (isNaN(parseFloat(value))) {
    return false;
  }

  return value.includes(".");
}

export function formatIngredientAmount(value: string): string {
  if (isDecimal(value)) {
    // if the value is coming across like 1.5 or 0.75 then lets make it a fractional value
    const decimalValue = parseFloat(value);
    return new Fraction(decimalValue).simplify(0.1).toFraction(true);
  } else {
    // if it's not a decimal, just send the value back
    return value;
  }
}

export function millisToHoursMinuteSeconds(ms: number) {
  // 1- Convert to seconds:
  let seconds = Math.floor(ms / 1000);

  // 2- Extract hours:
  let hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;

  // 3- Extract minutes:
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  return [hours, minutes, seconds];
}

export const calculateRemainingTimerMillis = (timer: TimerSchema): number => {
  const absoluteDuration = DateTime.fromJSDate(timer.created_at).toMillis() + timer.duration_ms;
  return absoluteDuration - DateTime.now().toMillis();
};

export const getTimerDisplay = (timer: TimerSchema) => {
  const remainingMs = calculateRemainingTimerMillis(timer);
  const [hours, minutes, seconds] = millisToHoursMinuteSeconds(remainingMs).map((item) => {
    return String(item).padStart(2, "0");
  });
  return `${hours}:${minutes}:${seconds}`;
};
