import { Constant } from "@recipiece/constant";
import { mealPlanSharesSubquery, mealPlanSharesWithMemberships, PrismaTransaction } from "@recipiece/database";
import { ListMealPlansQuerySchema, ListMealPlansResponseSchema, MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listMealPlans = async (request: AuthenticatedRequest<any, ListMealPlansQuerySchema>, tx: PrismaTransaction): ApiResponse<ListMealPlansResponseSchema> => {
  const user = request.user;
  const { page_number, page_size, shared_meal_plans } = request.query;
  const pageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;

  let query = tx.$kysely
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
      data: resultsData as MealPlanSchema[],
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
