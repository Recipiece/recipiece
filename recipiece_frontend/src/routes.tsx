import { DashboardPage, LoginPage, RegisterPage } from "./page";

export const unauthenticatedRoutes = [
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
];

export const authenticatedRoutes = [
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
];

export const unauthenticatedPaths = unauthenticatedRoutes.map((r) => r.path);
export const authenticatedPaths = authenticatedRoutes.map((r) => r.path);

export const allRoutes = [...unauthenticatedRoutes, ...authenticatedRoutes];
