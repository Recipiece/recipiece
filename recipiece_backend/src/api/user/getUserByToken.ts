import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { StatusCodes } from "http-status-codes";

export const getUserByToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  res.status(StatusCodes.OK).send(req.user);
};
