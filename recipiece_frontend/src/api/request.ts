import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { useContext, useMemo } from "react";
import { AuthContext } from "../context";
import { useNavigate } from "react-router-dom";

export const getUrl = (): string => {
  // @TODO -- change this later
  return "http://localhost:8080";
};

export interface MutationArgs<T> {
  readonly onSuccess?: (data: T) => void;
  readonly onFailure?: (err?: Error) => void;
}

export interface QueryArgs {
  readonly disabled?: boolean;
}

export interface HookArgs {
  readonly autoLogoutOnCodes?: number[];
}

export interface PostRequest<T> {
  readonly path: string;
  readonly body?: T;
  readonly withAuth?: boolean;
}

export interface PutRequest<T> {
  readonly path: string;
  readonly body?: T;
  readonly withAuth?: boolean;
}

export interface DeleteRequest {
  readonly path: string;
  readonly id: number;
  readonly withAuth?: boolean;
}

export const usePut = (args?: HookArgs) => {
  const { authToken, setAuthToken } = useContext(AuthContext);
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
    if (putRequest.withAuth) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    try {
      const response = await axios.put(`${getUrl()}${putRequest.path}`, putRequest.body, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        setAuthToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAuthToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { putter };
};

export const usePost = (args?: HookArgs) => {
  const { authToken, setAuthToken } = useContext(AuthContext);
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
    if (postRequest.withAuth) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    try {
      const response = await axios.post(`${getUrl()}${postRequest.path}`, postRequest.body, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        setAuthToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAuthToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { poster };
};

export interface GetRequest<T> {
  readonly path: string;
  readonly withAuth?: boolean;
  readonly query?: T;
}

export const useGet = (args?: HookArgs) => {
  const { authToken, setAuthToken } = useContext(AuthContext);
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
    if (getRequest.withAuth) {
      headers.set("Authorization", `Bearer ${authToken}`);
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
        setAuthToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<ResponseBodyType>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAuthToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { getter };
};

export const useDelete = (args?: HookArgs) => {
  const { authToken, setAuthToken } = useContext(AuthContext);
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
    if (deleteRequest.withAuth) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    try {
      const response = await axios.delete(`${getUrl()}${deleteRequest.path}/${deleteRequest.id}`, {
        headers: headers,
      });

      if (autoLogoutStatusCodes.includes(response.status)) {
        setAuthToken(undefined);
        navigate("/login");
        return Promise.reject();
      } else {
        return response as AxiosResponse<{}>;
      }
    } catch (error) {
      const statusCode = (error as AxiosError)?.status;

      if (statusCode && autoLogoutStatusCodes.includes(statusCode)) {
        setAuthToken(undefined);
        navigate("/login");
      }

      throw error;
    }
  };

  return { deleter };
};
