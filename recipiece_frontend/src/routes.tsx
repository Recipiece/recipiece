import { DashboardPage, LoginPage, RegisterPage, RecipeViewPage } from "./page";

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
  {
    path: "/recipe/view/:id",
    component: RecipeViewPage,
  },
];

export const unauthenticatedPaths = unauthenticatedRoutes.map((r) => r.path);
export const authenticatedPaths = authenticatedRoutes.map((r) => r.path);

export const allRoutes = [...unauthenticatedRoutes, ...authenticatedRoutes];
