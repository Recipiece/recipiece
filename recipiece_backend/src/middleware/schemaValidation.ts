import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AnyObject, Maybe, ObjectSchema } from "yup";

export const validateRequestBodySchema = (schema: ObjectSchema<Maybe<AnyObject>, unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body);
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

export const validateRequestParamsSchema = (schema: ObjectSchema<Maybe<AnyObject>, unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.params);
      next();
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).send({
        errors: (error as { errors: any[] })?.errors || [],
      });
    }
  };
};
