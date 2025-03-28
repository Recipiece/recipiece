import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../types";
import { Environment } from "../util/environment";

export const turnstileMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (Environment.ENABLE_TURNSTILE) {
    const [statusCode, response] = await checkToken(req);
    if (statusCode !== StatusCodes.OK) {
      res.status(statusCode).send(response);
    } else {
      next();
    }
  } else {
    next();
  }
};

const checkToken = async (req: Request): ApiResponse<{}> => {
  const verifyToken = req.headers["recipiece-verify-turnstile"];
  const secretKey = Environment.TURNSTILE_SECRET_KEY;

  if (Environment.TURNSTILE_SECRET_KEY) {
    console.error("missing APP_TURNSTILE_SECRET_KEY but turnstile verify was requested! check you env variables.");
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to process request",
      },
    ];
  }

  if (!verifyToken) {
    return [
      StatusCodes.IM_A_TEAPOT,
      {
        message: 'Must supply the "recipiece-verify-turnstile" header',
      },
    ];
  } else {
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const formData = new FormData();
    formData.append("secret", secretKey!);
    formData.append("response", verifyToken!.toString());

    try {
      const result = await fetch(url, {
        body: formData,
        method: "POST",
      });
      const outcome = await result.json();
      if (outcome.success) {
        return [StatusCodes.OK, {}];
      } else {
        console.debug(`cloudflare responded with ${outcome}`);
        return [
          StatusCodes.IM_A_TEAPOT,
          {
            message: "Cannot verify turnstile token",
          },
        ];
      }
    } catch (err) {
      console.error(err);
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to process request",
        },
      ];
    }
  }
};
