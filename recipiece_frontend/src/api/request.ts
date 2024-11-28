import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context";
import { RefreshTokenResponse } from "../data";
import { StorageKeys } from "../util";

export const getUrl = (): string => {
  // @TODO -- change this later
  return "http://localhost:8080";
};

export const getWebsocketUrl = (): string => {
  return "ws://localhost:8080";
};

export interface MutationArgs<SuccessType> {
  readonly onSuccess?: (data: SuccessType) => void;
  readonly onFailure?: (err?: Error) => void;
}

export interface QueryArgs {
  readonly disabled?: boolean;
  readonly xQueryKey?: string[];
}

export interface HookArgs {
  readonly autoLogoutOnCodes?: number[];
}

export interface PostRequest<T> {
  readonly path: string;
  readonly body?: T;
  readonly withAuth?: "access_token" | "refresh_token";
}

export interface PutRequest<T> {
  readonly path: string;
  readonly body?: T;
  readonly withAuth?: "access_token" | "refresh_token";
}

export interface DeleteRequest {
  readonly path: string;
  readonly id: number;
  readonly withAuth?: "access_token" | "refresh_token";
}

export interface GetRequest<T> {
  readonly path: string;
  readonly withAuth?: "access_token" | "refresh_token";
  readonly query?: T;
}

/**
 * This class intentionally sits outside of the state/render system.
 * We want to lazily make a refresh token call when the access token is about to expire,
 * BUT we don't want to send that call a bunch of times, we only want it once when needed.
 * 
 * I also wrote this at 2330 on a weeknight over a holiday so probably a little janky but it works
 */
class TokenResolver {
  public static instance: TokenResolver;

  public get accessToken(): string | undefined {
    const item = sessionStorage.getItem(StorageKeys.ACCESS_TOKEN);
    if (item) {
      return JSON.parse(item);
    }
    return undefined;
  }

  public get refreshToken(): string | undefined {
    const item = localStorage.getItem(StorageKeys.REFRESH_TOKEN);
    if (item) {
      return JSON.parse(item);
    }
    return undefined;
  }

  public static getInstance(): TokenResolver {
    if (!this.instance) {
      this.instance = new TokenResolver();
    }
    return this.instance;
  }

  private constructor(private promiseStack: Promise<any>[] = []) {}

  private async runRefresh() {
    const headers = new AxiosHeaders();
    headers.set("Authorization", `Bearer ${this.refreshToken}`);
    headers.set("Content-Type", "application/json");
    const response = await axios.post(
      `${getUrl()}/user/refresh-token`,
      {},
      {
        headers: headers,
      }
    );
    if (response.status === 200) {
      // huzzah, we have new tokens. Set them in the context and then surface them to the caller
      const responseData = response.data as RefreshTokenResponse;
      sessionStorage.setItem(StorageKeys.ACCESS_TOKEN, JSON.stringify(responseData.access_token));
      if (responseData.refresh_token !== this.refreshToken) {
        localStorage.setItem(StorageKeys.REFRESH_TOKEN, JSON.stringify(responseData.refresh_token));
      }
      return responseData;
    } else {
      // some error occurred, so don't turn back any tokens
      return { access_token: this.accessToken, refresh_token: this.refreshToken };
    }
  }

  public async resolveTokens(): Promise<{readonly refresh_token?: string, readonly access_token?: string}> {
    if (this.accessToken) {
      const decodedAccessToken = jwtDecode(this.accessToken);
      if (decodedAccessToken.exp) {
        const expiry = DateTime.fromSeconds(decodedAccessToken.exp);
        const isWithinFiveMinutesOfExpiry = expiry.diffNow().toMillis() < 5 * 60 * 1000;
        if (isWithinFiveMinutesOfExpiry && !!this.refreshToken) {
          if (this.promiseStack.length === 0) {
            const refreshPromise = this.runRefresh().finally(() => {
              this.promiseStack.pop();
            });
            this.promiseStack.push(refreshPromise);
          } else {
            return Promise.race(this.promiseStack);
          }
        } else if (expiry.diffNow().toMillis() > 0) {
          // their access token wasn't expired, so move them along
          return { access_token: this.accessToken, refresh_token: this.refreshToken };
        }
      }
    } else if (this.refreshToken) {
      // okay, they didn't have an access token. If they have a non-expired refresh token, run the refresh
      const decodedRefreshToken = jwtDecode(this.refreshToken);
      if (decodedRefreshToken.exp) {
        const expiry = DateTime.fromSeconds(decodedRefreshToken.exp);
        if (expiry.diffNow().toMillis() > 0) {
          // it wasn't expired! send the request
          if (this.promiseStack.length === 0) {
            const refreshPromise = this.runRefresh().finally(() => {
              this.promiseStack.pop();
            });
            this.promiseStack.push(refreshPromise);
            return refreshPromise;
          } else {
            return Promise.race(this.promiseStack);
          }
        }
      }
    }
    // sorry, can't help you out now
    return { access_token: this.accessToken, refresh_token: this.refreshToken };
  }
}

export const usePut = (args?: HookArgs) => {
  const { setAccessToken, setRefreshToken } = useContext(AuthContext);
  const tokenResolver = TokenResolver.getInstance();
  const navigate = useNavigate();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes) {
      return args.autoLogoutOnCodes;
    } else {
      return [401];
    }
  }, [args]);

  const putter = async <RequestBodyType, ResponseBodyType>(putRequest: PutRequest<RequestBodyType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (putRequest.withAuth === "access_token") {
      const tokens = await tokenResolver.resolveTokens();
      headers.set("Authorization", `Bearer ${tokens.access_token}`);
    }

    try {
      const response = await axios.put(`${getUrl()}${putRequest.path}`, putRequest.body, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { putter };
};

export const usePost = (args?: HookArgs) => {
  const { setAccessToken, setRefreshToken } = useContext(AuthContext);
  const tokenResolver = TokenResolver.getInstance();
  const navigate = useNavigate();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes) {
      return args.autoLogoutOnCodes;
    } else {
      return [401];
    }
  }, [args]);

  const poster = async <RequestBodyType, ResponseBodyType>(postRequest: PostRequest<RequestBodyType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (postRequest.withAuth === "access_token") {
      const tokens = await tokenResolver.resolveTokens();
      headers.set("Authorization", `Bearer ${tokens.access_token}`);
    }

    try {
      const response = await axios.post(`${getUrl()}${postRequest.path}`, postRequest.body, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { poster };
};

export const useGet = (args?: HookArgs) => {
  const { setAccessToken, setRefreshToken } = useContext(AuthContext);
  const tokenResolver = TokenResolver.getInstance();
  const navigate = useNavigate();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes) {
      return args.autoLogoutOnCodes;
    } else {
      return [401];
    }
  }, [args]);

  const getter = async <QueryParamType, ResponseBodyType>(getRequest: GetRequest<QueryParamType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (getRequest.withAuth === "access_token") {
      const tokens = await tokenResolver.resolveTokens();
      headers.set("Authorization", `Bearer ${tokens.access_token}`);
    }

    const queryString = getRequest.query ? new URLSearchParams(getRequest.query).toString() : "";

    let url = `${getUrl()}${getRequest.path}`;
    if (queryString) {
      url = `?${queryString}`;
    }

    try {
      const response = await axios.get(url, {
        headers: headers,
      });
      if (autoLogoutStatusCodes.includes(response.status)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { getter };
};

export const useDelete = (args?: HookArgs) => {
  const { setAccessToken, setRefreshToken } = useContext(AuthContext);
  const tokenResolver = TokenResolver.getInstance();
  const navigate = useNavigate();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes) {
      return args.autoLogoutOnCodes;
    } else {
      return [401];
    }
  }, [args]);

  const deleter = async (deleteRequest: DeleteRequest) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (deleteRequest.withAuth === "access_token") {
      const tokens = await tokenResolver.resolveTokens();
      headers.set("Authorization", `Bearer ${tokens.access_token}`);
    }

    try {
      const response = await axios.delete(`${getUrl()}${deleteRequest.path}/${deleteRequest.id}`, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<{}>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAccessToken(undefined);
        setRefreshToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { deleter };
};
