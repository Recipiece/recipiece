import { DateTime } from "luxon";

export function floorDateToDay(date: DateTime) {
  return DateTime.fromObject({
    year: date.year,
    month: date.month,
    day: date.day,
  });
}

export function floorDateToBeginningOfWeek(date: DateTime) {
  return date.minus({ days: date.weekday - 1 });
}
