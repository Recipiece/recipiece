import { AccountViewPage, CreateAccountPage, DashboardPage, ForgotPasswordPage, LoginPage, RecipeEditPage, RecipeViewPage, RegisterPage, VerifyAccountPage } from "./page";

export const unauthenticatedRoutes = [
  {
    path: "/login",
    element: LoginPage,
  },
  {
    path: "/register",
    element: RegisterPage,
  },
  {
    path: "/create-account",
    element: CreateAccountPage,
  },
  // {
  //   path: "/verify-account",
  //   element: VerifyAccountPage,
  // },
  {
    path: "/forgot-password",
    element: ForgotPasswordPage,
  },
];

export const authenticatedRoutes = [
  {
    path: "/dashboard",
    element: DashboardPage,
  },
  {
    path: "/recipe/view/:id",
    element: RecipeViewPage,
  },
  {
    path: "/recipe/edit/:id",
    element: RecipeEditPage,
  },
  {
    path: "/account",
    element: AccountViewPage,
  },
];

export const unauthenticatedPaths = unauthenticatedRoutes.map((r) => r.path);
export const authenticatedPaths = authenticatedRoutes.map((r) => r.path);

export const allRoutes = [...unauthenticatedRoutes, ...authenticatedRoutes];
