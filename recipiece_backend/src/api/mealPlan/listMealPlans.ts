import { Prisma } from "@prisma/client";
import { ListMealPlanQuerySchema, ListMealPlanResponseSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";
import { prisma } from "../../database";
import { StatusCodes } from "http-status-codes";

export const listMealPlans = async (
  request: AuthenticatedRequest<any, ListMealPlanQuerySchema>
): ApiResponse<ListMealPlanResponseSchema> => {
  const query = request.query;
  const { id: userId } = request.user;

  const pageSize = query.page_size ?? DEFAULT_PAGE_SIZE;
  const page = query.page_number;

  let where: Prisma.MealPlanWhereInput = {
    user_id: userId,
  };

  // if (search) {
  //   where.name = {
  //     contains: search,
  //     mode: "insensitive",
  //   };
  // }

  const offset = page * pageSize;

  const mealPlans = await prisma.mealPlan.findMany({
    where: where,
    skip: offset,
    take: pageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = mealPlans.length > pageSize;
  const resultsData = mealPlans.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page,
    },
  ];
};
