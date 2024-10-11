import { Prisma, Recipe, User } from "@prisma/client";
import { Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { prisma } from "../../database";
import { StatusCodes } from "http-status-codes";

export const listRecipes = async (req: AuthenticatedRequest, res: Response) => {
  const page = +(req.query?.page ?? 0);
  const pageSize = Math.max(5, Math.min(+(req.query?.pageSize ?? 20), 50));
  const userId = +(req.query?.userId ?? req.user.id);
  const search = req.query?.search;

  const [statusCode, response] = await runListRecipes(req.user, page, pageSize, userId, search as string);
  res.status(statusCode).send(response);
};

const runListRecipes = async (user: User, page: number, pageSize: number, userId: number, search?: string): ApiResponse<Recipe[]> => {
  let where: Prisma.RecipeWhereInput = {
    user_id: userId,
  };

  if(userId && userId !== user.id) {
    where.private = false;
  }

  if(search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    }
  }

  const offset = page * pageSize;

  const recipes = await prisma.recipe.findMany({
    where: where,
    include: {
      steps: true,
      ingredients: true,
    },
    skip: offset,
    take: pageSize,
    orderBy: {
      created_at: "asc",
    }
  });

  return [StatusCodes.OK, recipes];
};
