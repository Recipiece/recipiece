import { Constant } from "@recipiece/constant";
import { KyselyCore, PrismaTransaction } from "@recipiece/database";
import { ListMealPlansQuerySchema, ListMealPlansResponseSchema, MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { mealPlanSharesSubquery } from "./query";

export const listMealPlans = async (
  request: AuthenticatedRequest<any, ListMealPlansQuerySchema>,
  tx: PrismaTransaction
): ApiResponse<ListMealPlansResponseSchema> => {
  const user = request.user;
  const { page_number, page_size, shared_meal_plans_filter } = request.query;
  const pageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;

  let query = tx.$kysely
    .with("owned_meal_plans", (db) => {
      return db
        .selectFrom("meal_plans")
        .selectAll("meal_plans")
        .select((eb) => mealPlanSharesSubquery(eb, user.id).as("shares"))
        .where("meal_plans.user_id", "=", user.id);
    })
    .with("all_grant_shared_meal_plans", (db) => {
      return (
        db
          .selectFrom("user_kitchen_memberships")
          .innerJoin("users", "users.id", "user_kitchen_memberships.source_user_id")
          .innerJoin("meal_plans", "meal_plans.user_id", "user_id")
          .where((eb) => {
            return eb.and([
              eb("user_kitchen_memberships.destination_user_id", "=", user.id),
              eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
            ]);
          })
          .whereRef("user_kitchen_memberships.source_user_id", "=", "meal_plans.user_id")
          .selectAll("meal_plans")
          // these shares are synthetic because we don't explicitly create shares for "ALL" records
          .select((eb) => {
            return eb
              .fn("jsonb_build_array", [
                eb.fn("jsonb_build_object", [
                  KyselyCore.sql.lit("id"),
                  eb.lit(-1),
                  KyselyCore.sql.lit("created_at"),
                  eb.fn("now"),
                  KyselyCore.sql.lit("meal_plan_id"),
                  "meal_plans.id",
                  KyselyCore.sql.lit("user_kitchen_membership_id"),
                  "user_kitchen_memberships.id",
                ]),
              ])
              .as("shares");
          })
      );
    })
    .with("all_meal_plans", (db) => {
      if (shared_meal_plans_filter === "include") {
        return db
          .selectFrom("owned_meal_plans")
          .union((eb) => {
            return eb.selectFrom("all_grant_shared_meal_plans").selectAll();
          })
          .selectAll();
      } else {
        return db.selectFrom("owned_meal_plans").selectAll();
      }
    })
    .selectFrom("all_meal_plans")
    .selectAll("all_meal_plans");

  query = query.offset(page_number * pageSize).limit(pageSize + 1);
  query = query.orderBy("all_meal_plans.name asc");
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
