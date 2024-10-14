import { InferType, object, string } from "yup";

export const YValidateUserSchema = object({
  token: string().required(),
});

export interface ValidateUserSchema extends InferType<typeof YValidateUserSchema> {}
