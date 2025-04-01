import { DateTime } from "luxon";

export function floorDateToDay(date: DateTime) {
  return DateTime.fromObject(
    {
      year: date.year,
      month: date.month,
      day: date.day,
    },
    {
      zone: date.zone,
    }
  );
}

export function ceilDateToDay(date: DateTime) {
  return floorDateToDay(date).plus({ days: 1 });
}

export function floorDateToBeginningOfWeek(date: DateTime) {
  return date.minus({ days: date.weekday - 1 });
}
