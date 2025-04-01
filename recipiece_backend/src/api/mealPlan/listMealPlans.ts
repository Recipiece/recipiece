import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { ListMealPlansQuerySchema, ListMealPlansResponseSchema, MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { mealPlanSharesSubquery } from "./query";

export const listMealPlans = async (request: AuthenticatedRequest<any, ListMealPlansQuerySchema>, tx: PrismaTransaction): ApiResponse<ListMealPlansResponseSchema> => {
  const user = request.user;
  const { page_number, page_size, shared_meal_plans_filter = "include" } = request.query;
  const pageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;

  let query = tx.$kysely
    .with("owned_meal_plans", (db) => {
      return db
        .selectFrom("meal_plans")
        .selectAll("meal_plans")
        .select((eb) => mealPlanSharesSubquery(eb, user.id).as("shares"))
        .where("meal_plans.user_id", "=", user.id);
    })
    .with("selective_grant_shared_meal_plans", (db) => {
      return db
        .selectFrom("meal_plan_shares")
        .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "meal_plan_shares.user_kitchen_membership_id")
        .innerJoin("meal_plans", "meal_plans.id", "meal_plan_shares.meal_plan_id")
        .where((eb) => {
          return eb.and([
            eb.or([eb("user_kitchen_memberships.destination_user_id", "=", user.id), eb("user_kitchen_memberships.source_user_id", "=", user.id)]),
            eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
          ]);
        })
        .selectAll("meal_plans")
        .select((eb) => mealPlanSharesSubquery(eb, user.id).as("shares"));
    })
    .with("all_meal_plans", (db) => {
      if (shared_meal_plans_filter === "include") {
        return db
          .selectFrom("owned_meal_plans")
          .union((eb) => {
            return eb.selectFrom("selective_grant_shared_meal_plans").selectAll();
          })
          .selectAll();
      } else {
        return db.selectFrom("owned_meal_plans").selectAll();
      }
    })
    .selectFrom("all_meal_plans")
    .selectAll("all_meal_plans");

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
