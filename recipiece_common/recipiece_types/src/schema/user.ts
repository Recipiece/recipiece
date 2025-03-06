import { array, boolean, date, InferType, mixed, number, object, string } from "yup";
import { RecipeImportFiles, UserKitchenInvitationStatus } from "../util";
import { generateYListQueryResponseSchema, YListQuerySchema } from "./list";

export const YUserTagSchema = object({
  id: number().required(),
  content: string().required(),
  created_at: date().required(),
  user_id: number().required(),
}).noUnknown();

export const YUserPreferencesSchema = object({
  account_visibility: string().oneOf(["protected", "private"]),
});

export const YUserSchema = object({
  email: string().required(),
  username: string().required(),
  created_at: date().required(),
  validated: boolean().required(),
  id: number().required(),
  preferences: YUserPreferencesSchema,
}).noUnknown();

export const YUserKitchenMembershipSchema = object({
  id: number().required(),
  created_at: date().required(),
  grant_level: string().oneOf(["ALL", "SELECTIVE"]).required(),
  destination_user: object({
    id: number().required(),
    username: string().required(),
  }),
  source_user: object({
    id: number().required(),
    username: string().required(),
  }),
  status: string().oneOf([UserKitchenInvitationStatus.ACCEPTED, UserKitchenInvitationStatus.DENIED, UserKitchenInvitationStatus.PENDING]).required(),
});

export interface UserSchema extends InferType<typeof YUserSchema> {}

export interface UserKitchenMembershipSchema extends InferType<typeof YUserKitchenMembershipSchema> {}

export interface UserPreferencesSchema extends InferType<typeof YUserPreferencesSchema> {}

export interface UserTagSchema extends InferType<typeof YUserTagSchema> {}

export type UserKitchenMembershipSchemaStatus = UserKitchenMembershipSchema["status"];

/**
 * Create user
 */
export const YCreateUserRequestSchema = object({
  email: string().required(),
  username: string().required().min(5),
  password: string().required().min(8),
}).noUnknown();

export interface CreateUserRequestSchema extends InferType<typeof YCreateUserRequestSchema> {}

export const YCreateUserResponseSchema = object({
  id: number().required(),
  validated: boolean().required(),
  username: string().required(),
  email: string().required(),
  created_at: date().required(),
}).noUnknown();

export interface CreateUserResponseSchema extends InferType<typeof YCreateUserResponseSchema> {}

/**
 * Update user schema
 */
export const YUpdateUserRequestSchema = object({
  id: number().required(),
  username: string().optional(),
  email: string().optional(),
  preferences: YUserPreferencesSchema.optional(),
}).noUnknown();

export interface UpdateUserRequestSchema extends InferType<typeof YUpdateUserRequestSchema> {}

/**
 * Validate user account
 */
export const YValidateUserRequestSchema = object({
  token: string().required(),
}).noUnknown();

export interface ValidateUserRequestSchema extends InferType<typeof YValidateUserRequestSchema> {}

export const YValidateUserResponseSchema = object({
  validated: boolean().required(),
}).noUnknown();

export interface ValidateUserResponseSchema extends InferType<typeof YValidateUserResponseSchema> {}

/**
 * Login
 */
export const YLoginResponseSchema = object({
  access_token: string().required(),
  refresh_token: string().required(),
}).noUnknown();

export interface LoginResponseSchema extends InferType<typeof YLoginResponseSchema> {}

/**
 * Issue forgot password token
 */
export const YIssueForgotPasswordTokenRequestSchema = object({
  username_or_email: string().required(),
}).noUnknown();

export interface IssueForgotPasswordTokenRequestSchema extends InferType<typeof YIssueForgotPasswordTokenRequestSchema> {}

/**
 * Reset password
 */
export const YResetPasswordRequestSchema = object({
  password: string().required(),
  token: string().required(),
}).noUnknown();

export interface ResetPasswordRequestSchema extends InferType<typeof YResetPasswordRequestSchema> {}

/**
 * Refresh Token
 */
export const YRefreshTokenResponseSchema = object({
  access_token: string().required(),
  refresh_token: string().required(),
}).noUnknown();

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
}).noUnknown();

export interface RequestImportRecipesRequestSchema extends InferType<typeof YRequestImportRecipesRequestSchema> {}

/**
 * Create a push notification subscription
 */
export const YCreatePushNotificationRequestSubscriptionDataSchema = object({
  endpoint: string().required(),
  expirationTime: number().nullable(),
  keys: object({
    p256dh: string().required(),
    auth: string().required(),
  }),
});

export const YCreatePushNotificationRequestSchema = object({
  device_id: string().required(),
  subscription_data: YCreatePushNotificationRequestSubscriptionDataSchema,
}).noUnknown();

export interface CreatePushNotificationRequestSubscriptionDataSchema extends InferType<typeof YCreatePushNotificationRequestSubscriptionDataSchema> {}

export interface CreatePushNotificationRequestSchema extends InferType<typeof YCreatePushNotificationRequestSchema> {}

/**
 * Change password
 */
export const YChangePasswordRequestSchema = object({
  new_password: string().required(),
}).noUnknown();

export interface ChangePasswordRequestSchema extends InferType<typeof YChangePasswordRequestSchema> {}

/**
 * Invite user to kitchen
 */
export const YCreateUserKitchenMembershipRequestSchema = object({
  username: string().required().min(5),
}).noUnknown();

export interface CreateUserKitchenMembershipRequestSchema extends InferType<typeof YCreateUserKitchenMembershipRequestSchema> {}

/**
 * Set kitchen membership status
 */
export const YUpdateUserKitchenMembershipRequestSchema = object({
  id: number().required(),
  status: string().oneOf([UserKitchenInvitationStatus.ACCEPTED, UserKitchenInvitationStatus.DENIED]).notRequired(),
  grant_level: string().oneOf(["ALL", "SELECTIVE"]).notRequired(),
}).noUnknown();

export interface UpdateUserKitchenMembershipRequestSchema extends InferType<typeof YUpdateUserKitchenMembershipRequestSchema> {}

/**
 * List kitchen memberships
 */
export const YListUserKitchenMembershipsQuerySchema = YListQuerySchema.shape({
  targeting_self: boolean().notRequired(),
  from_self: boolean().notRequired(),
  status: array(string().oneOf(UserKitchenInvitationStatus.ALL_STATUSES))
    .notRequired()
    .transform((val) => {
      return val.split(",");
    }),
  entity_id: number().notRequired(),
  entity_filter: string().oneOf(["include", "exclude"]).notRequired(),
  entity_type: string().oneOf(["shopping_list", "recipe", "meal_plan", "cookbook"]).notRequired(),
})
  .test("oneOfTargetingSelfOrFromSelf", "Must specify at least one of targeting_self or from_self", (ctx) => {
    return !!ctx.from_self || !!ctx.targeting_self;
  })
  .test("entityHasProperContext", "Must specify entity_id, entity_filter, and entity_type together", (ctx) => {
    if (!!ctx.entity_id || !!ctx.entity_filter || !!ctx.entity_type) {
      return !!ctx.entity_id && !!ctx.entity_filter && !!ctx.entity_type;
    }
    return true;
  })
  .strict()
  .noUnknown();

export interface ListUserKitchenMembershipsQuerySchema extends InferType<typeof YListUserKitchenMembershipsQuerySchema> {}

export const YListUserKitchenMembershipsResponseSchema = generateYListQueryResponseSchema(YUserKitchenMembershipSchema);

export interface ListUserKitchenMembershipsResponseSchema extends InferType<typeof YListUserKitchenMembershipsResponseSchema> {}

/**
 * List user tags
 */
export const YListUserTagsQuerySchema = YListQuerySchema.shape({
  search: string().notRequired(),
});

export interface ListUserTagsQuerySchema extends InferType<typeof YListUserTagsQuerySchema> {}

export const YListUserTagsResponseSchema = generateYListQueryResponseSchema(YUserTagSchema);

export interface ListUserTagsResponseSchema extends InferType<typeof YListUserTagsResponseSchema> {}

/**
 * Create a user household membership
 */
