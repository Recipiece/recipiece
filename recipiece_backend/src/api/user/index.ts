import { recipeImportUploader } from "../../middleware";
import {
  YChangePasswordRequestSchema,
  YCreatePushNotificationRequestSchema,
  YCreateUserRequestSchema,
  YCreateUserResponseSchema,
  YIssueForgotPasswordTokenRequestSchema,
  YLoginResponseSchema,
  YRefreshTokenResponseSchema,
  YResetPasswordRequestSchema,
  YUpdateUserRequestSchema,
  YUserSchema,
  YValidateUserRequestSchema,
  YValidateUserResponseSchema,
} from "@recipiece/types";
import { Route } from "../../types";
import { changePassword } from "./changePassword";
import { createPushNotificationSubscription } from "./createPushNotificationSubscription";
import { createUser } from "./createUser";
import { deleteSelf } from "./deleteSelf";
import { getUserByToken } from "./getUserByToken";
import { issueEmailVerificationToken } from "./issueEmailVerificationToken";
import { issueForgotPasswordToken } from "./issueForgotPasswordToken";
import { USER_KITCHEN_MEMBERSHIP_ROUTES } from "./kitchenMembership";
import { loginUser } from "./loginUser";
import { logoutUser } from "./logoutUser";
import { refreshToken } from "./refreshToken";
import { requestImportRecipes } from "./requestImportRecipes";
import { resetPassword } from "./resetPassword";
import { updateUser } from "./updateUser";
import { validateUser } from "./validateUser";

export const LOGIN_ROUTES: Route[] = [
  {
    path: "/user/login",
    method: "POST",
    function: loginUser,
    authentication: "basic",
    responseSchema: YLoginResponseSchema,
  },
  {
    path: "/user/logout",
    method: "POST",
    function: logoutUser,
    authentication: "access_token",
  },
  {
    path: "/user/self",
    method: "GET",
    function: getUserByToken,
    authentication: "access_token",
    responseSchema: YUserSchema,
  },
  {
    path: "/user/self",
    method: "DELETE",
    function: deleteSelf,
    authentication: "access_token",
  },
  {
    path: "/user",
    method: "PUT",
    function: updateUser,
    authentication: "access_token",
    requestSchema: YUpdateUserRequestSchema,
    responseSchema: YUserSchema,
  },
  {
    path: "/user",
    method: "POST",
    function: createUser,
    authentication: "none",
    requestSchema: YCreateUserRequestSchema,
    responseSchema: YCreateUserResponseSchema,
  },
  {
    path: "/user/verify-email",
    method: "POST",
    function: validateUser,
    authentication: "access_token",
    requestSchema: YValidateUserRequestSchema,
    responseSchema: YValidateUserResponseSchema,
  },
  {
    path: "/user/request-token/verify-email",
    method: "POST",
    function: issueEmailVerificationToken,
    authentication: "access_token",
  },
  {
    path: "/user/request-token/forgot-password",
    method: "POST",
    function: issueForgotPasswordToken,
    authentication: "none",
    requestSchema: YIssueForgotPasswordTokenRequestSchema,
  },
  {
    path: "/user/reset-password",
    method: "POST",
    function: resetPassword,
    authentication: "none",
    requestSchema: YResetPasswordRequestSchema,
  },
  {
    path: "/user/change-password",
    method: "POST",
    function: changePassword,
    authentication: "basic",
    requestSchema: YChangePasswordRequestSchema,
  },
  {
    path: "/user/refresh-token",
    method: "POST",
    function: refreshToken,
    authentication: "refresh_token",
    responseSchema: YRefreshTokenResponseSchema,
  },
  {
    path: "/user/import-recipes",
    method: "POST",
    function: requestImportRecipes,
    authentication: "access_token",
    preMiddleware: [recipeImportUploader.single("file")],
  },
  {
    path: "/user/push-notifications/opt-in",
    method: "POST",
    function: createPushNotificationSubscription,
    authentication: "access_token",
    requestSchema: YCreatePushNotificationRequestSchema,
  },
  ...USER_KITCHEN_MEMBERSHIP_ROUTES,
];
