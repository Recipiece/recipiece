import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AnyObject, Maybe, ObjectSchema } from "yup";

export const validateRequestBodySchema = (schema: ObjectSchema<Maybe<AnyObject>, unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const castBody = schema.cast(req.body);
      await schema.validate(req.body);
      req.body = castBody;
      next();
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).send({
        errors: (error as { errors: any[] })?.errors || [],
      });
    }
  };
};

export const validateResponseSchema = (schema: ObjectSchema<Maybe<AnyObject>, unknown>) => {
  return async (_: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(schema.cast(res.json));
      next();
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.SERVICE_UNAVAILABLE).send({
        errors: (error as { errors: any[] })?.errors || [],
      });
    }
  };
};

export const validateRequestQuerySchema = (schema: ObjectSchema<Maybe<AnyObject>, unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const castQuery = schema.cast(req.query)
      await schema.validate(castQuery);
      // @ts-ignore
      req.query = castQuery;
      next();
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).send({
        errors: (error as { errors: any[] })?.errors || [],
      });
    }
  };
};
