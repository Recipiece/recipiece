export * from "yup";

declare module "yup" {
  

  // interface DateSchema<
  //   TType extends Maybe<Date> = Date | undefined,
  //   TContext extends AnyObject = AnyObject,
  //   TOut extends TType = TType
  // > extends yup.BaseSchema<TType, TContext, TOut> {
  //   luxon(): DateSchema<TType, TContext, DateTime>;
  // }

  // export default class LuxonDateTimeSchema<
  //   TType extends Maybe<number> = number | undefined,
  //   TContext = AnyObject,
  //   TDefault = undefined,
  //   TFlags extends Flags = ""
  // > extends Schema<TType, TContext, TDefault, TFlags> {
  //   constructor() {
  //     super({
  //       type: "luxonDateTime",
  //       check(value: any): value is NonNullable<TType> {
  //         try {
  //           if (typeof value === "string") {
  //             DateTime.fromISO(value);
  //             return true;
  //           } else {
  //             DateTime.fromJSDate(value);
  //             return true;
  //           }
  //         } catch {
  //           return false;
  //         }
  //       },
  //     });

  //     this.withMutation(() => {
  //       this.transform((value, _raw, ctx) => {
  //         if (!ctx.spec.coerce) return value;

  //         let parsed = value;
  //         if (typeof parsed === "string") {
  //           parsed = DateTime.fromISO(parsed);
  //         } else {
  //           parsed = DateTime.fromJSDate(parsed);
  //         }
  //         if (ctx.isType(parsed) || parsed === null) return parsed;;
  //       });
  //     });
  //   }
  // }

  // const luxonDateTime = () => {
  //   return this;
  // };
  // interface DateSchema<TType, TContext, TDefault, TFlags> {
  //   toLuxon(): this;
  // }

  // interface StringSchema<TType, TContext, TDefault, TFlags> {
  //   toLuxon(): this;
  // }
}
