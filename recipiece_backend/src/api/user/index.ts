import { recipeImportUploader } from "../../middleware";
import {
  YCreateUserRequestSchema,
  YCreateUserResponseSchema,
  YIssueForgotPasswordTokenRequestSchema,
  YLoginResponseSchema,
  YRefreshTokenResponseSchema,
  YRequestImportRecipesRequestSchema,
  YResetPasswordRequestSchema,
  YUserSchema,
  YValidateUserRequestSchema,
  YValidateUserResponseSchema,
} from "../../schema";
import { Route } from "../../types";
import { Versions } from "../../util/constant";
import { createUser } from "./createUser";
import { getUserByToken } from "./getUserByToken";
import { issueEmailVerificationToken } from "./issueEmailVerificationToken";
import { issueForgotPasswordToken } from "./issueForgotPasswordToken";
import { loginUser } from "./loginUser";
import { logoutUser } from "./logoutUser";
import { refreshToken } from "./refreshToken";
import { requestImportRecipes } from "./requestImportRecipes";
import { resetPassword } from "./resetPassword";
import { validateUser } from "./validateUser";

export const LOGIN_ROUTES: Route[] = [
  {
    path: "/user/login",
    method: "POST",
    function: loginUser,
    authentication: "basic",
    responseSchema: YLoginResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/user/logout",
    method: "POST",
    function: logoutUser,
    authentication: "access_token",
    version: Versions.ALL,
  },
  {
    path: "/user/self",
    method: "GET",
    function: getUserByToken,
    authentication: "access_token",
    responseSchema: YUserSchema,
    version: Versions.ALL,
  },
  {
    path: "/user/verify-email",
    method: "POST",
    function: validateUser,
    authentication: "access_token",
    requestSchema: YValidateUserRequestSchema,
    responseSchema: YValidateUserResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/user/request-token/verify-email",
    method: "POST",
    function: issueEmailVerificationToken,
    authentication: "access_token",
    version: Versions.ALL,
  },
  {
    path: "/user/request-token/forgot-password",
    method: "POST",
    function: issueForgotPasswordToken,
    authentication: "none",
    requestSchema: YIssueForgotPasswordTokenRequestSchema,
    version: Versions.ALL,
  },
  {
    path: "/user/reset-password",
    method: "POST",
    function: resetPassword,
    authentication: "none",
    requestSchema: YResetPasswordRequestSchema,
    version: Versions.ALL,
  },
  {
    path: "/user/refresh-token",
    method: "POST",
    function: refreshToken,
    authentication: "refresh_token",
    responseSchema: YRefreshTokenResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/user/import-recipes",
    method: "POST",
    function: requestImportRecipes,
    authentication: "access_token",
    // requestSchema: YRequestImportRecipesRequestSchema,
    preMiddleware: [recipeImportUploader.single("file")],
    version: Versions.ALL,
  },
];

if (process.env.APP_VERSION! !== Versions.CAST_IRON_SKILLET) {
  LOGIN_ROUTES.push({
    path: "/user/create",
    method: "POST",
    function: createUser,
    authentication: "none",
    requestSchema: YCreateUserRequestSchema,
    responseSchema: YCreateUserResponseSchema,
    version: Versions.ALL,
  });
}
