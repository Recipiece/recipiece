import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest, TokenPayload } from "../../types";

/**
 * When a user logs out, we expect there to be a valid auth token in the request that was used
 * 
 * This token belongs to a session (which also represents the refresh token), so we delete that session
 * from the database, effectively killing any and all auth tokens issues against that session.
 */
export const logoutUser = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const token = request.headers.authorization!
  const tokenSanitized = token.replace("Bearer", "").trim();

  try {
    const decoded = jwt.decode(tokenSanitized) as jwt.JwtPayload & TokenPayload;
    if (!decoded || !decoded.exp) {
      console.log(`could not decode token ${tokenSanitized}`);
      return [
        StatusCodes.UNAUTHORIZED,
        {
          message: "Not authorized",
        },
      ];
    }

    // kill the session that this token belongs to
    await prisma.userSession.delete({
      where: {
        id: decoded.session,
      }
    });

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
