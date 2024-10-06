import { Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { generateToken } from "../../util/token";

export const loginUser = async (req: AuthenticatedRequest, res: Response) => {
  const [responseCode, response] = await runLoginUser(req.body.username);
  res.status(responseCode).send(response);
};

export const runLoginUser = async (
  username: string
): ApiResponse<{ readonly token: string }> => {
  // at this point, we've made it through basic auth, so just issue the token
  const payload = {
    id: randomUUID(),
    user: username,
  };
  return [
    StatusCodes.OK,
    {
      token: generateToken(payload, "24h"),
    },
  ];
};
