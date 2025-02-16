import { ListMealPlanSharesQuerySchema, ListMealPlanSharesResponseSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { StatusCodes } from "http-status-codes";
import { DEFAULT_PAGE_SIZE } from "../../../util/constant";
import { Prisma, PrismaTransaction } from "@recipiece/database";

/**
 * List meal plan shares that are targeting the requesting user or the requesting user has sent.
 * Only user_kitchen_memberships with a status of "accepted" will be considered.
 */
export const listMealPlanShares = async (request: AuthenticatedRequest<any, ListMealPlanSharesQuerySchema>, tx: PrismaTransaction): ApiResponse<ListMealPlanSharesResponseSchema> => {
  const { page_number, page_size, targeting_self, from_self, user_kitchen_membership_id } = request.query;
  const actualPageSize = page_size ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.MealPlanShareWhereInput = {};
  let userKitchenMembershipWhere = {};

  if (!targeting_self && !from_self) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Must specify one of from_self or targeting_self",
      },
    ];
  }

  if (targeting_self) {
    userKitchenMembershipWhere = {
      ...userKitchenMembershipWhere,
      destination_user_id: request.user.id,
    };
  }
  if (from_self) {
    userKitchenMembershipWhere = {
      ...userKitchenMembershipWhere,
      source_user_id: request.user.id,
    };
  }

  if (user_kitchen_membership_id) {
    userKitchenMembershipWhere = { ...userKitchenMembershipWhere, id: user_kitchen_membership_id };
  }

  userKitchenMembershipWhere = { ...userKitchenMembershipWhere, status: "accepted" };

  const offset = page_number * actualPageSize;

  const mealPlanShares = await tx.mealPlanShare.findMany({
    where: {
      ...where,
      user_kitchen_membership: {
        ...userKitchenMembershipWhere,
      },
    },
    include: {
      meal_plan: true,
      user_kitchen_membership: {
        include: {
          source_user: true,
          destination_user: true,
        },
      },
    },
    skip: offset,
    take: actualPageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

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
