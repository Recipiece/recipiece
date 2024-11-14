import { Prisma, Recipe } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ListRecipesQuerySchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listRecipes = async (req: AuthenticatedRequest<any, ListRecipesQuerySchema>): ApiResponse<{
  readonly data: Recipe[];
  readonly page: number;
  readonly hasNextPage: boolean;
}> => {
  const query = req.query;
  const user = req.user;

  const userId = query.user_id ?? user.id;
  const pageSize = query.page_size;
  const page = query.page_number;
  const search = query.search;
  const cookbookId = query.cookbook_id;

  let where: Prisma.RecipeWhereInput = {
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

  if (cookbookId) {
    where.recipe_cookbook_attachments = {
      some: {
        cookbook_id: +cookbookId,
      },
    };
  }

  const offset = page * pageSize;

  const recipes = await prisma.recipe.findMany({
    where: where,
    include: {
      steps: true,
      ingredients: true,
    },
    skip: offset,
    take: pageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = recipes.length > pageSize;
  const resultsData = recipes.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      hasNextPage: hasNextPage,
      page: page,
    },
  ];
};
