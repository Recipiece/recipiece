import { User } from "@prisma/client";
import { Request, Response } from "express";

export type AuthenticatedRequest = Request & { readonly user: User };

export type ApiMethod =
  | ((req: Request, res: Response) => void | Promise<void>)
  | ((req: AuthenticatedRequest, res: Response) => void | Promise<void>);

export interface ErrorResponse {
  readonly message: string;
}

export type ApiResponse<T> = Promise<[number, T | ErrorResponse]>;

export interface Route {
  readonly method: "POST" | "PUT" | "GET" | "DELETE";
  readonly function: ApiMethod;
  readonly path: string;
  readonly authentication: "token" | "basic" | "none";
}
