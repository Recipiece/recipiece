import { mealPlanSharesWithMemberships, prisma, Redis, shoppingListSharesWithMemberships } from "@recipiece/database";
import { RequestMealPlanSessionResponseSchema } from "@recipiece/types";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const requestMealPlanSession = async (req: AuthenticatedRequest): ApiResponse<RequestMealPlanSessionResponseSchema> => {
  const user = req.user;
  const mealPlanId = +req.params.id;

  const mealPlan = await prisma.$kysely
    .selectFrom("meal_plans")
    .selectAll("meal_plans")
    .where((eb) => {
      return eb.and([
        eb("meal_plans.id", "=", mealPlanId),
        eb.or([eb("meal_plans.user_id", "=", user.id), eb.exists(mealPlanSharesWithMemberships(eb, user.id).select("meal_plan_shares.id").limit(1))]),
      ]);
    })
    .executeTakeFirst();

  if (!mealPlan) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal Plan ${mealPlanId} not found`,
      },
    ];
  }

  const wsToken = randomUUID().toString();
  const redis = await Redis.getInstance();

  await redis.hSet(`ws:${wsToken}`, ["purpose", "/meal-plan/modify", "entity_id", mealPlanId, "entity_type", "modifyMealPlanSession"]);
  await redis.sAdd(`modifyMealPlanSession:${mealPlanId}`, wsToken);

  return [
    StatusCodes.OK,
    {
      token: wsToken,
    },
  ];
};
