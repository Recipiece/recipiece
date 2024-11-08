import { User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { CookbookSchema } from "../../schema";

export const getCookbook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runGetCookbook(req.user, +req.params.id);
  res.status(statusCode).send(response);
};

const runGetCookbook = async (user: User, cookbookId: number): ApiResponse<CookbookSchema> => {
  const cookbook = await prisma.cookbook.findFirst({
    where: {
      id: cookbookId,
    },
  });

  if (!cookbook || (cookbook.private && cookbook.user_id !== user.id)) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook not found",
      },
    ];
  }

  return [StatusCodes.OK, cookbook];
};
