import { InferType, number, object, string } from "yup";

export const YListQuerySchema = object({
  page_number: number().required(),
  page_size: number().min(1).max(50).default(10).required(),
  search: string().notRequired(),
}).strict().noUnknown();

export interface ListQuerySchema extends InferType<typeof YListQuerySchema> {}
