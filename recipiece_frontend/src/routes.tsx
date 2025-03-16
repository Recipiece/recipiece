import {
  AccountViewPage,
  CreateAccountPage,
  DashboardPage,
  ForgotPasswordPage,
  MembershipViewPage,
  MembershipsPage,
  LoginPage,
  MealPlanConfigurationPage,
  MealPlanViewPage,
  NotFoundPage,
  RecipeEditPage,
  RecipeViewPage,
  RegisterPage,
  ResetPasswordPage,
  ShoppingListViewPage,
} from "./page";

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
  {
    path: "/forgot-password",
    element: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    element: ResetPasswordPage,
  },
];

export const authenticatedRoutes = [
  {
    path: "/dashboard/all",
    element: DashboardPage,
  },
  {
    path: "/dashboard",
    element: DashboardPage,
  },
  {
    path: "/cookbook/:cookbookId",
    element: DashboardPage,
  },
  {
    path: "/kitchen/:membershipId",
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
  {
    path: "/shopping-list/:shoppingListId",
    element: ShoppingListViewPage,
  },
  {
    path: "/meal-plan/view/:id",
    element: MealPlanViewPage,
  },
  {
    path: "/meal-plan/view/:id/configuration",
    element: MealPlanConfigurationPage,
  },
  {
    path: "/memberships/:membershipId",
    element: MembershipViewPage,
  },
  {
    path: "/memberships",
    element: MembershipsPage,
  },
  // {
  //   path: "/notifications",
  //   element: NotificationsViewPage,
  // },
];

export const unauthenticatedPaths = unauthenticatedRoutes.map((r) => r.path);
export const authenticatedPaths = authenticatedRoutes.map((r) => r.path);

export const allRoutes = [
  ...unauthenticatedRoutes,
  ...authenticatedRoutes,
  {
    path: "*",
    element: NotFoundPage, 
  }
];
