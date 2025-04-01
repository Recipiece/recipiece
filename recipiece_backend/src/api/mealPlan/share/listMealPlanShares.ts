import { Constant } from "@recipiece/constant";
import { KyselyCore, MealPlan, PrismaTransaction } from "@recipiece/database";
import { ListMealPlanSharesQuerySchema, ListMealPlanSharesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const listMealPlanShares = async (
  request: AuthenticatedRequest<any, ListMealPlanSharesQuerySchema>,
  tx: PrismaTransaction
): ApiResponse<ListMealPlanSharesResponseSchema> => {
  const user = request.user;
  const { page_number, page_size, targeting_self, from_self, user_kitchen_membership_id } = request.query;
  const actualPageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;

  if (!targeting_self && !from_self) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Must specify one of from_self or targeting_self",
      },
    ];
  }

  let sharesQuery = tx.$kysely
    .selectFrom("meal_plan_shares")
    .selectAll("meal_plan_shares")
    .select(() => {
      return KyselyCore.sql<MealPlan>`to_json(meal_plans.*)`.as("meal_plan");
    })
    .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "meal_plan_shares.user_kitchen_membership_id")
    .innerJoin("meal_plans", "meal_plan_shares.meal_plan_id", "meal_plans.id")
    .where((eb) => {
      return eb.or([eb("user_kitchen_memberships.destination_user_id", "=", user.id), eb("user_kitchen_memberships.source_user_id", "=", user.id)]);
    })
    .where((eb) => {
      return eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
    });

  if (targeting_self) {
    sharesQuery = sharesQuery.where("meal_plans.user_id", "!=", user.id);
  }
  if (from_self) {
    sharesQuery = sharesQuery.where("meal_plans.user_id", "=", user.id);
  }
  if (user_kitchen_membership_id) {
    sharesQuery = sharesQuery.where("user_kitchen_memberships.id", "=", user_kitchen_membership_id);
  }

  sharesQuery = sharesQuery.offset(page_number * actualPageSize);
  sharesQuery = sharesQuery.limit(actualPageSize + 1);

  const mealPlanShares = await sharesQuery.execute();
  const hasNextPage = mealPlanShares.length > actualPageSize;
  const resultsData = mealPlanShares.splice(0, actualPageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
