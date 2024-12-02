import { createContext, FC, PropsWithChildren, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocalStorage, useSessionStorage } from "../hooks";
import { authenticatedPaths, unauthenticatedPaths } from "../routes";
import { StorageKeys } from "../util";

export const AuthContext = createContext<{
  readonly accessToken?: string;
  readonly setAccessToken: (val: string | undefined) => void;
  readonly refreshToken?: string;
  readonly setRefreshToken: (val: string | undefined) => void;
}>({
  accessToken: undefined,
  setAccessToken: () => {},
  refreshToken: undefined,
  setRefreshToken: () => {},
});

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [accessToken, _setAccessToken, _removeAccessToken] = useSessionStorage<string | undefined>(StorageKeys.ACCESS_TOKEN, undefined);
  const [refreshToken, _setRefreshToken, _removeRefreshToken] = useLocalStorage<string | undefined>(StorageKeys.REFRESH_TOKEN, undefined);

  const setAccessToken = useCallback(
    (value: string | undefined) => {
      if (value) {
        _setAccessToken(value);
      } else {
        _removeAccessToken();
      }
    },
    [_setAccessToken, _removeAccessToken]
  );

  const setRefreshToken = useCallback(
    (value: string | undefined) => {
      if (value) {
        _setRefreshToken(value);
      } else {
        _removeRefreshToken();
      }
    },
    [_setRefreshToken, _removeRefreshToken]
  );

  useEffect(() => {
    const isUnauthenticatedPath = unauthenticatedPaths.includes(location.pathname);
    const isAuthenticatedPath = authenticatedPaths.includes(location.pathname);
    const hasAccessToken = !!accessToken;
    const hasRefreshToken = !!refreshToken;

    if ((isUnauthenticatedPath && hasAccessToken) || (isUnauthenticatedPath && hasRefreshToken)) {
      navigate("/dashboard");
    } else if (isAuthenticatedPath && !hasAccessToken && !hasRefreshToken) {
      navigate("/login");
    } else if (location.pathname === "/") {
      if (hasAccessToken || (!hasAccessToken && hasRefreshToken)) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [location.pathname, accessToken, refreshToken, navigate]);

  return (
    <AuthContext.Provider
      value={{
        accessToken: accessToken,
        setAccessToken: setAccessToken,
        refreshToken: refreshToken,
        setRefreshToken: setRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
