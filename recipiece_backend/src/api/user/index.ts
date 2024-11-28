import {
  YCreateUserRequestSchema,
  YCreateUserResponseSchema,
  YIssueForgotPasswordTokenRequestSchema,
  YLoginResponseSchema,
  YRefreshTokenResponseSchema,
  YResetPasswordRequestSchema,
  YUserSchema,
  YValidateUserRequestSchema,
  YValidateUserResponseSchema
} from "../../schema";
import { Route } from "../../types";
import { createUser } from "./createUser";
import { getUserByToken } from "./getUserByToken";
import { issueEmailVerificationToken } from "./issueEmailVerificationToken";
import { issueForgotPasswordToken } from "./issueForgotPasswordToken";
import { loginUser } from "./loginUser";
import { logoutUser } from "./logoutUser";
import { refreshToken } from "./refreshToken";
import { resetPassword } from "./resetPassword";
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
    path: "/user/create",
    method: "POST",
    function: createUser,
    authentication: "none",
    requestSchema: YCreateUserRequestSchema,
    responseSchema: YCreateUserResponseSchema,
  },
  {
    path: "/user/self",
    method: "GET",
    function: getUserByToken,
    authentication: "access_token",
    responseSchema: YUserSchema,
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
    path: "/user/refresh-token",
    method: "POST",
    function: refreshToken,
    authentication: "refresh_token",
    responseSchema: YRefreshTokenResponseSchema,
  },
];
