import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { createBrowserRouter, Route, RouterProvider, Routes } from "react-router-dom";
import { AuthenticatedLayout, Toaster, ToastProvider, TooltipProvider, UnauthenticatedLayout } from "./component";
import { AuthContextProvider, DialogContextProvider, PushNotificationContextProvider, TimerContextProvider } from "./context";
import { useLayout } from "./hooks";
import { authenticatedRoutes, unauthenticatedRoutes } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 1,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export const AppRoutes: FC = () => {
  const { isMobile } = useLayout();

  const dndBackend = useMemo(() => {
    return isMobile ? TouchBackend : HTML5Backend;
  }, [isMobile]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <PushNotificationContextProvider>
          <TooltipProvider>
            <ToastProvider>
              <DndProvider backend={dndBackend}>
                <DialogContextProvider>
                  <TimerContextProvider>
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
                  </TimerContextProvider>
                </DialogContextProvider>
              </DndProvider>
              <Toaster />
            </ToastProvider>
          </TooltipProvider>
        </PushNotificationContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const router = createBrowserRouter([{ path: "*", element: <AppRoutes /> }]);

export const App: FC = () => {
  return <RouterProvider router={router} />;
};
