import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message: string) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class ContentTooLargeError extends ApiError {
  constructor(message: string) {
    super(message, StatusCodes.REQUEST_TOO_LONG);
  }
}
