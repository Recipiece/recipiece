import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC } from "react";
import {
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import { AuthenticatedLayout, Toaster } from "./component";
import { AuthContextProvider } from "./context";
import { authenticatedRoutes, unauthenticatedRoutes } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export const AppRoutes: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <Routes>
          {unauthenticatedRoutes.map((r) => {
            return <Route key={r.path} path={r.path} element={<r.element />} />;
          })}
          {authenticatedRoutes.map((r) => {
            return (
              <Route
                key={r.path}
                path={r.path}
                element={
                  <AuthenticatedLayout>
                    <r.element />
                  </AuthenticatedLayout>
                }
              />
            );
          })}
          {/* {allRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={<r.element />} />
          ))} */}
        </Routes>
        <Toaster />
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const router = createBrowserRouter([{ path: "*", element: <AppRoutes /> }]);

export const App: FC = () => {
  return <RouterProvider router={router} />;
};
