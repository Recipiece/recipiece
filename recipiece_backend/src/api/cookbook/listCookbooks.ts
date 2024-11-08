import { Prisma, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CookbookSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listCookbooks = async (req: AuthenticatedRequest, res: Response) => {
  const page = +(req.query?.page ?? 0);
  const pageSize = Math.max(5, Math.min(+(req.query?.pageSize ?? 20), 50));
  const userId = +(req.query?.userId ?? req.user.id);
  const search = req.query?.search;

  const [statusCode, response] = await runListCookbooks(req.user, page, pageSize, userId, search as string);
  res.status(statusCode).send(response);
};

const runListCookbooks = async (
  user: User,
  page: number,
  pageSize: number,
  userId: number,
  search?: string
): ApiResponse<{
  readonly data: CookbookSchema[];
  readonly page: number;
  readonly hasNextPage: boolean;
}> => {
  let where: Prisma.CookbookWhereInput = {
    user_id: userId,
  };

  if (userId && userId !== user.id) {
    where.private = false;
  }

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const offset = page * pageSize;

  const cookbooks = await prisma.cookbook.findMany({
    where: where,
    skip: offset,
    take: pageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = cookbooks.length > pageSize;
  const resultsData = cookbooks.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      hasNextPage: hasNextPage,
      page: page,
    },
  ];
};
