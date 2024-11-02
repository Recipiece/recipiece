import { Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";


export const requestExportData = async (req: AuthenticatedRequest, res: Response) => {
  const [responseCode, response] = await runExportData(req.user);
  res.status(responseCode).send(response);
};

export const runExportData = async (user: User): ApiResponse<{}> => {
  return [StatusCodes.OK, {}]
}