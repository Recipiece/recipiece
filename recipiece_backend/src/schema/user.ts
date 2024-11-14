import { boolean, date, InferType, number, object, string } from "yup";

export const YUserSchema = object({
  email: string().required(),
  created_at: date().required(),
  validated: boolean().required(),
  id: number().required(),
})
  .strict()
  .noUnknown();

export interface UserSchema extends InferType<typeof YUserSchema> {}

/**
 * Create user
 */
export const YCreateUserRequestSchema = object({
  username: string().required(),
  password: string().required(),
})
  .strict()
  .noUnknown();

export interface CreateUserRequestSchema extends InferType<typeof YCreateUserRequestSchema> {}

export const YCreateUserResponseSchema = object({
  id: number().required(),
  validated: boolean().required(),
  email: string().required(),
  created_at: date().required(),
})
  .strict()
  .noUnknown();

export interface CreateUserResponseSchema extends InferType<typeof YCreateUserResponseSchema> {}

/**
 * Validate user account
 */
export const YValidateUserRequestSchema = object({
  token: string().required(),
})
  .strict()
  .noUnknown();

export interface ValidateUserRequestSchema extends InferType<typeof YValidateUserRequestSchema> {}

export const YValidateUserResponseSchema = object({
  validated: boolean().required(),
})
  .strict()
  .noUnknown();

export interface ValidateUserResponseSchema extends InferType<typeof YValidateUserResponseSchema> {}

/**
 * Login
 */
export const YLoginResponseSchema = object({
  token: string().required(),
})
  .strict()
  .noUnknown();

export interface LoginResponseSchema extends InferType<typeof YLoginResponseSchema> {}
