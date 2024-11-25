import { array, boolean, InferType, ISchema, number, object, string } from "yup";
import { DEFAULT_PAGE_SIZE } from "../util/constant";

export const YListQuerySchema = object({
  page_number: number().required(),
  page_size: number().min(1).max(DEFAULT_PAGE_SIZE).default(DEFAULT_PAGE_SIZE).notRequired(),
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
