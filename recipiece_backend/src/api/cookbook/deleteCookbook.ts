import { User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteCookBook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runDeleteCookBook(req.user, +req.params.id);
  res.status(statusCode).send(response);
};

const runDeleteCookBook = async (user: User, cookbookId: number): ApiResponse<{}> => {
  const cookbook = await prisma.cookBook.findFirst({
    where: {
      user_id: user.id,
      id: cookbookId,
    },
  });

  if (!cookbook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook not found",
      },
    ];
  }

  await prisma.$transaction(async (tx) => {
    await tx.cookBook.delete({
      where: {
        id: cookbookId,
      },
    });
  });

  return [StatusCodes.OK, {}];
};
