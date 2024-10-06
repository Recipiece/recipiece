import { Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Redis } from "../../database";

export const logoutUser = async (req: AuthenticatedRequest, res: Response) => {
  // we've made it through token auth, so the token must be there
  const [responseCode, response] = await runLogoutUser(
    req.headers.authorization!
  );
  res.status(responseCode).send(response);
};

const runLogoutUser = async (token: string): ApiResponse<{}> => {
  const tokenSanitized = token.replace("Bearer", "").trim();

  try {
    const decoded = jwt.decode(tokenSanitized) as { exp: number };
    if (!decoded || !decoded.exp) {
      console.log(`could not decode token ${tokenSanitized}`);
      return [
        StatusCodes.UNAUTHORIZED,
        {
          message: "Not authorized",
        },
      ];
    }

    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    if (expiresIn > 0) {
      console.log("token was not already expired, blacklisting it");
      const redis = await Redis.getInstance();
      await redis.set(tokenSanitized, "blacklistedTokens", { EX: expiresIn });
    }
    return [StatusCodes.OK, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to process request",
      },
    ];
  }
};
