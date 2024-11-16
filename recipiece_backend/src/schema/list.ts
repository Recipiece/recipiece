import { AnyObject, array, boolean, InferType, ISchema, Maybe, number, object, ObjectSchema, string } from "yup";

export const YListQuerySchema = object({
  page_number: number().required(),
  page_size: number().min(1).max(50).default(10).notRequired(),
  search: string().notRequired(),
})
  .strict()
  .noUnknown();

export interface ListQuerySchema extends InferType<typeof YListQuerySchema> {}

export const generateYListQuerySchema = (dataSchema: ISchema<any, any, any, any>) => {
  return object({
    data: array(dataSchema).required(),
    has_next_page: boolean().required(),
    page: number().required(),
  });
};
