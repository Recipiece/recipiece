import { createContext, FC, PropsWithChildren, useCallback, useEffect } from "react";
import { StorageKeys } from "../util";
import { useLocation, useNavigate } from "react-router-dom";
import { authenticatedPaths, unauthenticatedPaths } from "../routes";
import { useQueryClient } from "@tanstack/react-query";

export const AuthContext = createContext<{
  readonly authToken?: string;
  readonly setAuthToken: (val: string | undefined) => void;
}>({
  authToken: undefined,
  setAuthToken: () => {},
});

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const authToken = localStorage.getItem(StorageKeys.TOKEN);
  const queryClient = useQueryClient();

  // useEffect(() => {
  //   queryClient.clear();
  // }, []);

  const setAuthToken = useCallback((value: string | undefined) => {
    if (value) {
      localStorage.setItem(StorageKeys.TOKEN, value);
    } else {
      localStorage.removeItem(StorageKeys.TOKEN);
    }
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (unauthenticatedPaths.includes(location.pathname) && !!authToken) {
      navigate("/dashboard");
    } else if (authenticatedPaths.includes(location.pathname) && !authToken) {
      navigate("/login");
    } else if (location.pathname === "/") {
      if (authToken) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [location.pathname, authToken]);

  return (
    <AuthContext.Provider
      value={{
        authToken: authToken || undefined,
        setAuthToken: setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
