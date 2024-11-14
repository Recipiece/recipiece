import { YCreateUserRequestSchema, YCreateUserResponseSchema, YLoginResponseSchema, YUserSchema, YValidateUserRequestSchema, YValidateUserResponseSchema } from "../../schema";
import { Route } from "../../types";
import { createUser } from "./createUser";
import { getUserByToken } from "./getUserByToken";
import { issueEmailVerificationToken } from "./issueEmailVerificationToken";
import { loginUser } from "./loginUser";
import { logoutUser } from "./logoutUser";
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
    authentication: "token",
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
    authentication: "token",
    responseSchema: YUserSchema,
  },
  {
    path: "/user/verify-email",
    method: "POST",
    function: validateUser,
    authentication: "token",
    requestSchema: YValidateUserRequestSchema,
    responseSchema: YValidateUserResponseSchema,
  },
  {
    path: "/user/request-token/verify-email",
    method: "POST",
    function: issueEmailVerificationToken,
    authentication: "token",
  },
  // {
  //   path: "/user/data/export",
  //   method: "POST",
  //   function: requestExportData,
  //   authentication: "token",
  // },
];
