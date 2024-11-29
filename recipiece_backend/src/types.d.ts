import { User, UserSession } from "@prisma/client";
import { Request, Response, ParamsDictionary } from "express";
import { WSRequest, WSRequestHandler } from "websocket-express";
import { ObjectSchema } from "yup";

export type AuthenticatedRequest<BodyType = any, QueryType = any> = Request<any, any, BodyType, QueryType> & {
  readonly user: User;
  readonly user_session: UserSession;
};

export interface WebsocketRequest<T> {
  readonly ws_message: T;
  readonly ws_token: string;
  readonly ws_token_payload: WebsocketTokenPayload;
}

export interface WebsocketTokenPayload {
  readonly purpose: string;
  readonly entity_id: string;
  readonly entity_type: string;
}

export type ApiMethod<BodyType = any, QueryType = any, ResponseType = any> =
  | ((req: Request<any, any, BodyType, QueryType>) => ResponseType | Promise<ResponseType>)
  | ((req: AuthenticatedRequest<BodyType, QueryType>) => ResponseType | Promise<ResponseType>);

export type WebsocketMethod<RequestType = any, ResponseType = any> = (
  req: WebsocketRequest<RequestType>
) => Promise<[number, ResponseType | ErrorResponse]>;

export interface ErrorResponse {
  readonly message: string;
  readonly errors?: any[];
}

export type ApiResponse<T> = Promise<[number, T | ErrorResponse]>;

export interface Route {
  readonly method: "POST" | "PUT" | "GET" | "DELETE";
  readonly function: ApiMethod;
  readonly path: string;
  readonly authentication: "access_token" | "basic" | "none" | "refresh_token";
  readonly requestSchema?: ObjectSchema;
  readonly responseSchema?: ObjectSchema;
  readonly version: string;
}

export interface WebsocketRoute {
  readonly function: WebsocketMethod;
  readonly path: string;
  readonly authentication: "token" | "none";
  readonly requestSchema: ObjectSchema;
  readonly responseSchema?: ObjectSchema;
  readonly version: string;
}

export interface TokenPayload {
  readonly session: string;
  readonly id: string;
  readonly user: number;
  readonly scope: string;
}
