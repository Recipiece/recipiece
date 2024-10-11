import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { useContext } from "react";
import { AuthContext } from "../context";

export const getUrl = (): string => {
  // @TODO -- change this later
  return "http://localhost:8080";
}

export interface MutationArgs<T> {
  readonly onSuccess?: (data: T) => void;
  readonly onFailure?: (err?: Error) => void;
}

export interface PostRequest<T> {
  readonly path: string;
  readonly body?: T;
  readonly withAuth?: boolean;
}

export const usePost = () => {
  const { authToken } = useContext(AuthContext);

  const post = async<RequestBodyType, ResponseBodyType> (postRequest: PostRequest<RequestBodyType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if(postRequest.withAuth) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }
    
    return axios.post(`${getUrl()}${postRequest.path}`, postRequest.body, {
      headers: headers,
    }) as Promise<AxiosResponse<ResponseBodyType>>;
  }

  return {post};
}

export interface GetRequest<T> {
  readonly path: string;
  readonly withAuth?: boolean;
  readonly query?: T;
}

export const useGet = () => {
  const { authToken } = useContext(AuthContext);

  const get = async<QueryParamType, ResponseBodyType> (getRequest: GetRequest<QueryParamType>) => {
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if(getRequest.withAuth) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }
    const queryString = getRequest.query ? new URLSearchParams(getRequest.query).toString() : "";

    let url = `${getUrl()}${getRequest.path}`;
    if(queryString) {
      url = `?${queryString}`;
    }
    
    return axios.get(url, {
      headers: headers,
    }) as Promise<AxiosResponse<ResponseBodyType>>;
  }

  return {get};
}