import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC } from "react";
import {
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import { AuthContextProvider } from "./context";
import { allRoutes } from "./routes";
import { Toaster } from "./component";

const queryClient = new QueryClient();

export const AppRoutes: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <Routes>
          {allRoutes.map((r) => (
            <Route key={r.path} {...r} />
          ))}
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
