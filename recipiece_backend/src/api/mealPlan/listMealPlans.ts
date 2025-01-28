import { ListMealPlansQuerySchema, ListMealPlansResponseSchema, YMealPlanConfigurationSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE } from "../../util/constant";
import { mealPlanSharesSubquery, mealPlanSharesWithMemberships, Prisma, prisma } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";

export const listMealPlans = async (request: AuthenticatedRequest<any, ListMealPlansQuerySchema>): ApiResponse<ListMealPlansResponseSchema> => {
  const user = request.user;
  const { page_number, page_size, shared_meal_plans } = request.query;
  const pageSize = page_size ?? DEFAULT_PAGE_SIZE;

  let query = prisma.$kysely
    .selectFrom("meal_plans")
    .selectAll("meal_plans")
    .select((eb) => {
      return [mealPlanSharesSubquery(eb, user.id).as("shares")];
    })
    .where((eb) => {
      if (shared_meal_plans === "include") {
        return eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]);
      } else {
        return eb("meal_plans.user_id", "=", user.id);
      }
    });

  query = query.offset(page_number * pageSize).limit(pageSize + 1);
  const mealPlans = await query.execute();

  const hasNextPage = mealPlans.length > pageSize;
  const resultsData = mealPlans.splice(0, pageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData.map((result) => {
        return {
          ...result,
          configuration: YMealPlanConfigurationSchema.cast(result.configuration),
        };
      }),
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
