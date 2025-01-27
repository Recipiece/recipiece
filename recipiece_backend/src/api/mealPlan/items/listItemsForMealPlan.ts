import { DEFAULT_PAGE_SIZE, ListItemsForMealPlanQuerySchema, ListItemsForMealPlanResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { Prisma, prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const listItemsForMealPlan = async (request: AuthenticatedRequest<any, ListItemsForMealPlanQuerySchema>): ApiResponse<ListItemsForMealPlanResponseSchema> => {
  const { start_date, end_date, page_number, page_size } = request.query;
  const pageSize = page_size ?? DEFAULT_PAGE_SIZE;
  const mealPlanId = +request.params.id;
  const { id: userId } = request.user;

  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      user_id: userId,
      id: mealPlanId,
    },
  });

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan ${mealPlanId} not found`,
      },
    ];
  }

  let safeStartDate;
  if (!start_date) {
    // if the user didn't provide a start_date, just set it to a week ago
    safeStartDate = DateTime.utc().minus({ days: 7 });
  } else {
    // if they did provide a start date, clamp it to the min of the meal plan's created_at and whatever they gave
    safeStartDate = DateTime.max(DateTime.fromISO(start_date), DateTime.fromJSDate(mealPlan.created_at).minus({ days: 1 }));
  }

  let safeEndDate;
  if (!end_date) {
    // if the didn't provide an end_date, just set it to a week from now
    safeEndDate = DateTime.utc().plus({ days: 7 });
  } else {
    // if they did provide an end_date, we will clamp it to max of 6 months from the safe start date
    safeEndDate = DateTime.min(safeStartDate.plus({ months: 6 }), DateTime.fromISO(end_date));
  }

  const filters: Prisma.MealPlanItemWhereInput = {
    meal_plan_id: mealPlanId,
    start_date: {
      gte: safeStartDate.toJSDate(),
      lte: safeEndDate.toJSDate(),
    },
  };

  const offset = page_number * pageSize;

  const items = await prisma.mealPlanItem.findMany({
    where: filters,
    orderBy: {
      created_at: "asc",
    },
    skip: offset,
    take: pageSize + 1,
    include: {
      recipe: {
        include: {
          ingredients: true,
          steps: true,
        },
      },
    },
  });

  const hasNextPage = items.length > pageSize;
  const resultsData = items.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
