import { Constant } from "@recipiece/constant";
import { Prisma, PrismaTransaction } from "@recipiece/database";
import { ListCookbooksQuerySchema, ListCookbooksResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listCookbooks = async (req: AuthenticatedRequest<any, ListCookbooksQuerySchema>, tx: PrismaTransaction): ApiResponse<ListCookbooksResponseSchema> => {
  const user = req.user;

  const page = req.query.page_number;
  const pageSize = req.query.page_size || Constant.DEFAULT_PAGE_SIZE;
  const excludeContainingRecipeId = req.query.exclude_containing_recipe_id;
  const search = req.query.search;

  let where: Prisma.CookbookWhereInput = {
    user_id: user.id,
  };

  if (excludeContainingRecipeId) {
    where.recipe_cookbook_attachments = {
      none: {
        recipe_id: excludeContainingRecipeId,
      },
    };
  }

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const offset = page * pageSize;

  const cookbooks = await tx.cookbook.findMany({
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
      has_next_page: hasNextPage,
      page: page,
    },
  ];
};
