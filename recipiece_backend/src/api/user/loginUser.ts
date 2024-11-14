import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { generateToken } from "../../util/token";
import { LoginResponseSchema } from "../../schema";

export const loginUser = async (request: AuthenticatedRequest): ApiResponse<LoginResponseSchema> => {
  // at this point, we've made it through basic auth, so just issue the token
  const payload = {
    id: randomUUID(),
    user: request.user.email,
  };
  return [
    StatusCodes.OK,
    {
      token: generateToken(payload, "24h"),
    },
  ];
};
