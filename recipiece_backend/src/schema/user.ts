import { boolean, date, InferType, mixed, number, object, string } from "yup";
import { RecipeImportFiles } from "../util/constant";

export const YUserSchema = object({
  email: string().required(),
  username: string().required(),
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
  email: string().required(),
  username: string().required(),
  password: string().required(),
})
  .strict()
  .noUnknown();

export interface CreateUserRequestSchema extends InferType<typeof YCreateUserRequestSchema> {}

export const YCreateUserResponseSchema = object({
  id: number().required(),
  validated: boolean().required(),
  username: string().required(),
  email: string().required(),
  created_at: date().required(),
})
  .strict()
  .noUnknown();

export interface CreateUserResponseSchema extends InferType<typeof YCreateUserResponseSchema> {}

/**
 * Update user schema
 */
export const YUpdateUserRequestSchema = object({
  id: number().required(),
  username: string().optional(),
  email: string().optional(),
})
  .strict()
  .noUnknown();

export interface UpdateUserRequestSchema extends InferType<typeof YUpdateUserRequestSchema> {}

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
  access_token: string().required(),
  refresh_token: string().required(),
})
  .strict()
  .noUnknown();

export interface LoginResponseSchema extends InferType<typeof YLoginResponseSchema> {}

/**
 * Issue forgot password token
 */
export const YIssueForgotPasswordTokenRequestSchema = object({
  username_or_email: string().required(),
})
  .strict()
  .noUnknown();

export interface IssueForgotPasswordTokenRequestSchema
  extends InferType<typeof YIssueForgotPasswordTokenRequestSchema> {}

/**
 * Reset password
 */
export const YResetPasswordRequestSchema = object({
  password: string().required(),
  token: string().required(),
})
  .strict()
  .noUnknown();

export interface ResetPasswordRequestSchema extends InferType<typeof YResetPasswordRequestSchema> {}

/**
 * Refresh Token
 */
export const YRefreshTokenResponseSchema = object({
  access_token: string().required(),
  refresh_token: string().required(),
})
  .strict()
  .noUnknown();

export interface RefreshTokenResponseSchema extends InferType<typeof YRefreshTokenResponseSchema> {}

/**
 * Request Import Recipes
 */
export const YRequestImportRecipesRequestSchema = object({
  source: string().oneOf(["paprika"], "The file format is not one of the known file formats").required(),
  file: mixed()
    .test("fileSize", "The provided file is too large", (value) => {
      // @ts-ignore
      return value[0].size <= RecipeImportFiles.MAX_SIZE;
    })
    .test("fileType", "The provided file is not an acceptable format", (value) => {
      RecipeImportFiles.SUPPORTED_EXTENSIONS.includes(value as string);
    })
    .required(),
})
  .strict()
  .noUnknown();

export interface RequestImportRecipesRequestSchema extends InferType<typeof YRequestImportRecipesRequestSchema> {}

/**
 * Create a push notification subscription
 */
export const YCreatePushNotificationRequestSchema = object({
  device_id: string().required(),
  subscription_data: object({
    endpoint: string().required(),
    expirationTime: string().nullable(),
    keys: object({
      p256dh: string().required(),
      auth: string().required(),
    }),
  }),
})
  .strict()
  .noUnknown();

export interface CreatePushNotificationRequestSchema extends InferType<typeof YCreatePushNotificationRequestSchema> {}

/**
 * Change password
 */
export const YChangePasswordRequestSchema = object({
  new_password: string().required()
}).strict().noUnknown();

export interface ChangePasswordRequestSchema extends InferType<typeof YChangePasswordRequestSchema> {}
