import { DateTime } from "luxon";
import { mixed, MixedSchema } from "yup";

export const luxony = () => {
  return mixed((input): input is (Date | string | DateTime) => {
    return (
      typeof input === "string"
      || input instanceof Date 
      || input instanceof DateTime
    );
  }).transform((val: any, input, ctx): DateTime | undefined => {
    if (val instanceof DateTime) {
      return val;
    }

    let parsed: DateTime;
    if (typeof val === "string") {
      parsed = DateTime.fromISO(val);
    } else {
      parsed = DateTime.fromJSDate(val);
    }
    if (parsed.isValid) {
      return parsed.toUTC();
    }

    return undefined;
  });
};
