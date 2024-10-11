import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
} from "react";
import { StorageKeys } from "../util";
import { useLocation, useNavigate } from "react-router-dom";
import { authenticatedPaths, unauthenticatedPaths } from "../routes";

export const AuthContext = createContext<{
  readonly authToken?: string;
  readonly setAuthToken: (val: string) => void;
}>({
  authToken: undefined,
  setAuthToken: () => {},
});

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const authToken = localStorage.getItem(StorageKeys.TOKEN);

  const setAuthToken = useCallback((value: string) => {
    localStorage.setItem(StorageKeys.TOKEN, value);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (unauthenticatedPaths.includes(location.pathname) && !!authToken) {
      navigate("/dashboard");
    } else if (authenticatedPaths.includes(location.pathname) && !authToken) {
      navigate("/login");
    } else if (authToken) {
      navigate("/dashboard");
    } else if (!authToken) {
      navigate("/login");
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
