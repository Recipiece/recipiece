import { Prisma } from "@prisma/client";
import { ListRecipeSharesQuerySchema, ListRecipeSharesResponseSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { StatusCodes } from "http-status-codes";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";
import { prisma } from "../../database";

/**
 * List recipes shares that are targeting you or that you have sent
 */
export const listRecipeSharesForSelf = async (
  request: AuthenticatedRequest<any, ListRecipeSharesQuerySchema>
): ApiResponse<ListRecipeSharesResponseSchema> => {
  const { page_number, page_size, targeting_self, from_self } = request.query;
  const actualPageSize = page_size ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.RecipeShareWhereInput = {};

  if (targeting_self) {
    where.user_kitchen_membership = {
      destination_user_id: request.user.id,
    };
  } else if (from_self) {
    where.user_kitchen_membership = {
      source_user_id: request.user.id,
    };
  } else {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Must specify one of from_self or targeting_self",
      },
    ];
  }

  const offset = page_number * actualPageSize;

  const recipes = await prisma.recipeShare.findMany({
    where: where,
    include: {
      recipe: true,
      user_kitchen_membership: {
        include: {
          source_user: true,
          destination_user: true,
        }
      }
    },
    skip: offset,
    take: actualPageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = recipes.length > actualPageSize;
  const resultsData = recipes.splice(0, actualPageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
