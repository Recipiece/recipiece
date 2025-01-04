import { AnyObject, array, boolean, InferType, ISchema, Maybe, number, object, ObjectSchema, string } from "yup";
import { DEFAULT_PAGE_SIZE } from "../util/constant";

export const YListQuerySchema = object({
  page_number: number().required(),
  page_size: number()
    .min(1)
    .max(DEFAULT_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .notRequired()
    .transform((val) => {
      return val ?? DEFAULT_PAGE_SIZE;
    }),
})
  .strict()
  .noUnknown();

export interface ListQuerySchema extends InferType<typeof YListQuerySchema> {}

export function generateYListQuerySchema<T extends Maybe<AnyObject>>(dataSchema: ObjectSchema<T>) {
  return object({
    data: array(dataSchema).required(),
    has_next_page: boolean().required(),
    page: number().required(),
  });
};
