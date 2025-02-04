import { InferType } from "yup";
export declare const YUserPreferencesSchema: import("yup").ObjectSchema<{
    account_visibility: string | undefined;
}, import("yup").AnyObject, {
    account_visibility: undefined;
}, "">;
export interface UserPreferencesSchema extends InferType<typeof YUserPreferencesSchema> {
}
export declare const YUserSchema: import("yup").ObjectSchema<{
    email: string;
    username: string;
    created_at: Date;
    validated: NonNullable<boolean | undefined>;
    id: number;
    preferences: {
        account_visibility?: string | undefined;
    };
}, import("yup").AnyObject, {
    email: undefined;
    username: undefined;
    created_at: undefined;
    validated: undefined;
    id: undefined;
    preferences: {
        account_visibility: undefined;
    };
}, "">;
export interface UserSchema extends InferType<typeof YUserSchema> {
}
export declare const YUserKitchenMembershipSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    destination_user: {
        id: number;
        username: string;
    };
    source_user: {
        id: number;
        username: string;
    };
    status: NonNullable<"accepted" | "denied" | "pending" | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    destination_user: {
        id: undefined;
        username: undefined;
    };
    source_user: {
        id: undefined;
        username: undefined;
    };
    status: undefined;
}, "">;
export interface UserKitchenMembershipSchema extends InferType<typeof YUserKitchenMembershipSchema> {
}
export type UserKitchenMembershipSchemaStatus = UserKitchenMembershipSchema["status"];
/**
 * Create user
 */
export declare const YCreateUserRequestSchema: import("yup").ObjectSchema<{
    email: string;
    username: string;
    password: string;
}, import("yup").AnyObject, {
    email: undefined;
    username: undefined;
    password: undefined;
}, "">;
export interface CreateUserRequestSchema extends InferType<typeof YCreateUserRequestSchema> {
}
export declare const YCreateUserResponseSchema: import("yup").ObjectSchema<{
    id: number;
    validated: NonNullable<boolean | undefined>;
    username: string;
    email: string;
    created_at: Date;
}, import("yup").AnyObject, {
    id: undefined;
    validated: undefined;
    username: undefined;
    email: undefined;
    created_at: undefined;
}, "">;
export interface CreateUserResponseSchema extends InferType<typeof YCreateUserResponseSchema> {
}
/**
 * Update user schema
 */
export declare const YUpdateUserRequestSchema: import("yup").ObjectSchema<{
    id: number;
    username: string | undefined;
    email: string | undefined;
    preferences: {
        account_visibility?: string | undefined;
    } | undefined;
}, import("yup").AnyObject, {
    id: undefined;
    username: undefined;
    email: undefined;
    preferences: {
        account_visibility: undefined;
    };
}, "">;
export interface UpdateUserRequestSchema extends InferType<typeof YUpdateUserRequestSchema> {
}
/**
 * Validate user account
 */
export declare const YValidateUserRequestSchema: import("yup").ObjectSchema<{
    token: string;
}, import("yup").AnyObject, {
    token: undefined;
}, "">;
export interface ValidateUserRequestSchema extends InferType<typeof YValidateUserRequestSchema> {
}
export declare const YValidateUserResponseSchema: import("yup").ObjectSchema<{
    validated: NonNullable<boolean | undefined>;
}, import("yup").AnyObject, {
    validated: undefined;
}, "">;
export interface ValidateUserResponseSchema extends InferType<typeof YValidateUserResponseSchema> {
}
/**
 * Login
 */
export declare const YLoginResponseSchema: import("yup").ObjectSchema<{
    access_token: string;
    refresh_token: string;
}, import("yup").AnyObject, {
    access_token: undefined;
    refresh_token: undefined;
}, "">;
export interface LoginResponseSchema extends InferType<typeof YLoginResponseSchema> {
}
/**
 * Issue forgot password token
 */
export declare const YIssueForgotPasswordTokenRequestSchema: import("yup").ObjectSchema<{
    username_or_email: string;
}, import("yup").AnyObject, {
    username_or_email: undefined;
}, "">;
export interface IssueForgotPasswordTokenRequestSchema extends InferType<typeof YIssueForgotPasswordTokenRequestSchema> {
}
/**
 * Reset password
 */
export declare const YResetPasswordRequestSchema: import("yup").ObjectSchema<{
    password: string;
    token: string;
}, import("yup").AnyObject, {
    password: undefined;
    token: undefined;
}, "">;
export interface ResetPasswordRequestSchema extends InferType<typeof YResetPasswordRequestSchema> {
}
/**
 * Refresh Token
 */
export declare const YRefreshTokenResponseSchema: import("yup").ObjectSchema<{
    access_token: string;
    refresh_token: string;
}, import("yup").AnyObject, {
    access_token: undefined;
    refresh_token: undefined;
}, "">;
export interface RefreshTokenResponseSchema extends InferType<typeof YRefreshTokenResponseSchema> {
}
/**
 * Request Import Recipes
 */
export declare const YRequestImportRecipesRequestSchema: import("yup").ObjectSchema<{
    source: "paprika";
    file: {};
}, import("yup").AnyObject, {
    source: undefined;
    file: undefined;
}, "">;
export interface RequestImportRecipesRequestSchema extends InferType<typeof YRequestImportRecipesRequestSchema> {
}
/**
 * Create a push notification subscription
 */
export declare const YCreatePushNotificationRequestSubscriptionDataSchema: import("yup").ObjectSchema<{
    endpoint: string;
    expirationTime: number | null | undefined;
    keys: {
        p256dh: string;
        auth: string;
    };
}, import("yup").AnyObject, {
    endpoint: undefined;
    expirationTime: undefined;
    keys: {
        p256dh: undefined;
        auth: undefined;
    };
}, "">;
export declare const YCreatePushNotificationRequestSchema: import("yup").ObjectSchema<{
    device_id: string;
    subscription_data: {
        expirationTime?: number | null | undefined;
        keys: {
            p256dh: string;
            auth: string;
        };
        endpoint: string;
    };
}, import("yup").AnyObject, {
    device_id: undefined;
    subscription_data: {
        endpoint: undefined;
        expirationTime: undefined;
        keys: {
            p256dh: undefined;
            auth: undefined;
        };
    };
}, "">;
export interface CreatePushNotificationRequestSubscriptionDataSchema extends InferType<typeof YCreatePushNotificationRequestSubscriptionDataSchema> {
}
export interface CreatePushNotificationRequestSchema extends InferType<typeof YCreatePushNotificationRequestSchema> {
}
/**
 * Change password
 */
export declare const YChangePasswordRequestSchema: import("yup").ObjectSchema<{
    new_password: string;
}, import("yup").AnyObject, {
    new_password: undefined;
}, "">;
export interface ChangePasswordRequestSchema extends InferType<typeof YChangePasswordRequestSchema> {
}
/**
 * Invite user to kitchen
 */
export declare const YCreateUserKitchenMembershipRequestSchema: import("yup").ObjectSchema<{
    username: string;
}, import("yup").AnyObject, {
    username: undefined;
}, "">;
export interface CreateUserKitchenMembershipRequestSchema extends InferType<typeof YCreateUserKitchenMembershipRequestSchema> {
}
/**
 * Set kitchen membership status
 */
export declare const YSetUserKitchenMembershipStatusRequestSchema: import("yup").ObjectSchema<{
    id: number;
    status: NonNullable<"accepted" | "denied" | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    status: undefined;
}, "">;
export interface SetUserKitchenMembershipStatusRequestSchema extends InferType<typeof YSetUserKitchenMembershipStatusRequestSchema> {
}
export declare const YSetUserKitchenMembershipStatusResponseSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    destination_user: {
        id: number;
        username: string;
    };
    source_user: {
        id: number;
        username: string;
    };
    status: NonNullable<"accepted" | "denied" | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    destination_user: {
        id: undefined;
        username: undefined;
    };
    source_user: {
        id: undefined;
        username: undefined;
    };
    status: undefined;
}, "">;
export interface SetUserKitchenMembershipStatusResponseSchema extends InferType<typeof YSetUserKitchenMembershipStatusResponseSchema> {
}
/**
 * List kitchen memberships
 */
export declare const YListUserKitchenMembershipsQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    targeting_self: import("yup").Maybe<boolean | undefined>;
    from_self: import("yup").Maybe<boolean | undefined>;
    status: import("yup").Maybe<("accepted" | "denied" | "pending" | undefined)[] | undefined>;
    entity_id: import("yup").Maybe<number | undefined>;
    entity: import("yup").Maybe<"include" | "exclude" | undefined>;
    entity_type: import("yup").Maybe<"recipe" | "meal_plan" | "shopping_list" | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    targeting_self: undefined;
    from_self: undefined;
    status: undefined;
    entity_id: undefined;
    entity: undefined;
    entity_type: undefined;
}, "">;
export interface ListUserKitchenMembershipsQuerySchema extends InferType<typeof YListUserKitchenMembershipsQuerySchema> {
}
export declare const YListUserKitchenMembershipsResponseSchema: import("yup").ObjectSchema<{
    data: {
        id: number;
        created_at: Date;
        destination_user: {
            id: number;
            username: string;
        };
        source_user: {
            id: number;
            username: string;
        };
        status: NonNullable<"accepted" | "denied" | "pending" | undefined>;
    }[];
    has_next_page: NonNullable<boolean | undefined>;
    page: number;
}, import("yup").AnyObject, {
    data: undefined;
    has_next_page: undefined;
    page: undefined;
}, "">;
export interface ListUserKitchenMembershipsResponseSchema extends InferType<typeof YListUserKitchenMembershipsResponseSchema> {
}
//# sourceMappingURL=user.d.ts.map