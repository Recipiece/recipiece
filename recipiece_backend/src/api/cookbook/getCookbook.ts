import { User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { CookBookSchema } from "../../schema";

export const getCookBook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runGetCookBook(req.user, +req.params.id);
  res.status(statusCode).send(response);
};

const runGetCookBook = async (user: User, cookbookId: number): ApiResponse<CookBookSchema> => {
  const cookbook = await prisma.cookBook.findFirst({
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
