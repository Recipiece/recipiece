import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { Redis } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const logoutUser = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const token = request.headers.authorization!
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
