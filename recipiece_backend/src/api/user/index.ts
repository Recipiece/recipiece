import { Route } from "../../types";
import { createUser } from "./createUser";
import { getUserByToken } from "./getUserByToken";
import { loginUser } from "./loginUser";
import { logoutUser } from "./logoutUser";
import { validateUser } from "./validateUser";

export const LOGIN_ROUTES: Route[] = [
  {
    path: "/user/login",
    method: "POST",
    function: loginUser,
    authentication: "basic",
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
  },
  {
    path: "/user/self",
    method: "GET",
    function: getUserByToken,
    authentication: "token",
  },
  {
    path: "/user/validate",
    method: "POST",
    function: validateUser,
    authentication: "none",
  }
];
