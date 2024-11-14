import { User } from "@prisma/client";
import { Request, Response, ParamsDictionary } from "express";
import { ObjectSchema } from "yup";

export type AuthenticatedRequest<BodyType = any, QueryType = any> = Request<any, any, BodyType, QueryType> & { readonly user: User };

export type ApiMethod<BodyType = any, QueryType = any, ResponseType = any> =
  | ((req: Request<any, any, BodyType, QueryType>) => ResponseType | Promise<ResponseType>)
  | ((req: AuthenticatedRequest<BodyType, QueryType>) => ResponseType | Promise<ResponseType>);

export interface ErrorResponse {
  readonly message: string;
  readonly errors?: any[];
}

export type ApiResponse<T> = Promise<[number, T | ErrorResponse]>;

export interface Route {
  readonly method: "POST" | "PUT" | "GET" | "DELETE";
  readonly function: ApiMethod;
  readonly path: string;
  readonly authentication: "token" | "basic" | "none";
  readonly requestSchema?: ObjectSchema;
  readonly responseSchema?: ObjectSchema;
}
