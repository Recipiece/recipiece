import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC } from "react";
import { createBrowserRouter, Route, RouterProvider, Routes } from "react-router-dom";
import { AuthenticatedLayout, Toaster, ToastProvider, TooltipProvider, UnauthenticatedLayout } from "./component";
import { AuthContextProvider, CookbookContextProvider } from "./context";
import { authenticatedRoutes, unauthenticatedRoutes } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export const AppRoutes: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <TooltipProvider>
          <ToastProvider>
            <CookbookContextProvider>
              <Routes>
                <Route element={<UnauthenticatedLayout />}>
                  {unauthenticatedRoutes.map((r) => {
                    return <Route key={r.path} path={r.path} element={<r.element />} />;
                  })}
                </Route>
                <Route element={<AuthenticatedLayout />}>
                  {authenticatedRoutes.map((r) => {
                    return <Route key={r.path} path={r.path} element={<r.element />} />;
                  })}
                </Route>
              </Routes>
            </CookbookContextProvider>
            <Toaster />
          </ToastProvider>
        </TooltipProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const router = createBrowserRouter([{ path: "*", element: <AppRoutes /> }]);

export const App: FC = () => {
  return <RouterProvider router={router} />;
};
