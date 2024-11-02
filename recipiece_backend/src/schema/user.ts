import { InferType, object, string } from "yup";

export const YValidateUserSchema = object({
  token: string().required(),
}).strict().noUnknown();

export interface ValidateUserSchema extends InferType<typeof YValidateUserSchema> {}
