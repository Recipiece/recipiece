import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TokenManager } from "./TokenManager";

export const getUrl = (): string => {
  return process.env.REACT_APP_API_URL!;
};

export const getWebsocketUrl = (): string => {
  return process.env.REACT_APP_WEBSOCKET_URL!;
};

export const filtersToSearchParams = (filters: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  Object.keys(filters).forEach((filterKey) => {
    if (filters[filterKey] !== null && filters[filterKey] !== undefined) {
      searchParams.append(filterKey, filters[filterKey].toString());
    }
  });
  return searchParams;
};

export type MutationArgs<Result = unknown, Input = void> = Omit<UseMutationOptions<Result, AxiosError, Input>, "mutationFn" | "mutationKey">;

export type QueryArgs<T> = Omit<UseQueryOptions<T, AxiosError>, "queryFn" | "queryKey">;

export interface HookArgs {
  readonly autoLogoutOnCodes?: number[];
}

export interface PostRequest<T> {
  readonly path: string;
  readonly body?: T;
  readonly withAuth?: "access_token" | "refresh_token";
  readonly extraHeaders?: { readonly [key: string]: string };
}

export interface PutRequest<T> {
  readonly path: string;
  readonly body?: T;
  readonly withAuth?: "access_token" | "refresh_token";
}

export interface DeleteRequest {
  readonly path: string;
  readonly id?: number;
  readonly withAuth?: "access_token" | "refresh_token";
}

export interface GetRequest<T> {
  readonly path: string;
  readonly withAuth?: "access_token" | "refresh_token";
  readonly query?: T;
}

const useResolveTokens = () => {
  const navigate = useNavigate();

  const resolveAccessToken = async () => {
    const tokenResolver = TokenManager.getInstance();
    try {
      const tokens = await tokenResolver.resolveTokens();
      if (tokens.access_token) {
        return tokens.access_token;
      } else {
        tokenResolver.clear();
        navigate("/login");
        return Promise.reject();
      }
    } catch {
      tokenResolver.clear();
      navigate("/login");
      return Promise.reject();
    }
  };

  return { resolveAccessToken };
};

export const usePut = (args?: HookArgs) => {
  const tokenResolver = TokenManager.getInstance();
  const { resolveAccessToken } = useResolveTokens();
  const navigate = useNavigate();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes !== undefined) {
      return args.autoLogoutOnCodes;
    } else {
      return [403];
    }
  }, [args]);

  const putter = async <RequestBodyType, ResponseBodyType>(putRequest: PutRequest<RequestBodyType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (putRequest.withAuth === "access_token") {
      headers.set("Authorization", `Bearer ${await resolveAccessToken()}`);
    }

    try {
      const response = await axios.put(`${getUrl()}${putRequest.path}`, putRequest.body, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        tokenResolver.clear();
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        tokenResolver.clear();
        navigate("/login");
      }

      throw error;
    }
  };

  return { putter };
};

export const usePost = (args?: HookArgs) => {
  const tokenResolver = TokenManager.getInstance();
  const navigate = useNavigate();
  const { resolveAccessToken } = useResolveTokens();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes !== undefined) {
      return args.autoLogoutOnCodes;
    } else {
      return [403];
    }
  }, [args]);

  const poster = async <RequestBodyType, ResponseBodyType>(postRequest: PostRequest<RequestBodyType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (postRequest.withAuth === "access_token") {
      headers.set("Authorization", `Bearer ${await resolveAccessToken()}`);
    }

    if (postRequest.extraHeaders) {
      Object.keys(postRequest.extraHeaders).forEach((key) => {
        headers.set(key, postRequest.extraHeaders![key]);
      });
    }

    try {
      const response = await axios.post(`${getUrl()}${postRequest.path}`, postRequest.body, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        tokenResolver.clear();
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        tokenResolver.clear();
        navigate("/login");
      }

      throw error;
    }
  };

  return { poster };
};

export const useGet = (args?: HookArgs) => {
  const tokenResolver = TokenManager.getInstance();
  const navigate = useNavigate();
  const { resolveAccessToken } = useResolveTokens();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes !== undefined) {
      return args.autoLogoutOnCodes;
    } else {
      return [403];
    }
  }, [args]);

  const getter = async <QueryParamType, ResponseBodyType>(getRequest: GetRequest<QueryParamType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (getRequest.withAuth === "access_token") {
      headers.set("Authorization", `Bearer ${await resolveAccessToken()}`);
    }

    const queryString = getRequest.query ? new URLSearchParams(getRequest.query).toString() : "";

    let url = `${getUrl()}${getRequest.path}`;
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const response = await axios.get(url, {
        headers: headers,
      });
      if (autoLogoutStatusCodes.includes(response.status)) {
        tokenResolver.clear();
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        tokenResolver.clear();
        navigate("/login");
      }

      throw error;
    }
  };

  return { getter };
};

export const useDelete = (args?: HookArgs) => {
  const tokenResolver = TokenManager.getInstance();
  const navigate = useNavigate();
  const { resolveAccessToken } = useResolveTokens();

  const autoLogoutStatusCodes = useMemo(() => {
    if (args?.autoLogoutOnCodes !== undefined) {
      return args.autoLogoutOnCodes;
    } else {
      return [403];
    }
  }, [args]);

  const deleter = async (deleteRequest: DeleteRequest) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (deleteRequest.withAuth === "access_token") {
      headers.set("Authorization", `Bearer ${await resolveAccessToken()}`);
    }

    try {
      let path = `${getUrl()}${deleteRequest.path}`;
      if (deleteRequest.id) {
        path += `/${deleteRequest.id}`;
      }
      const response = await axios.delete(path, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        tokenResolver.clear();
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<{}>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        tokenResolver.clear();
        navigate("/login");
      }

      throw error;
    }
  };

  return { deleter };
};
