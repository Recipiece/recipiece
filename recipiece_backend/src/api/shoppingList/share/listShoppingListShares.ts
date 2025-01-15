import { Prisma } from "@prisma/client";
import { ListShoppingListSharesQuerySchema, ListShoppingListSharesResponseSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { StatusCodes } from "http-status-codes";
import { DEFAULT_PAGE_SIZE } from "../../../util/constant";
import { prisma } from "../../../database";

/**
 * List shoppingLists shares that are targeting the requesting user or the requesting user has sent.
 * Only user_kitchen_memberships with a status of "accepted" will be considered.
 */
export const listShoppingListShares = async (
  request: AuthenticatedRequest<any, ListShoppingListSharesQuerySchema>
): ApiResponse<ListShoppingListSharesResponseSchema> => {
  const { page_number, page_size, targeting_self, from_self, user_kitchen_membership_id } = request.query;
  const actualPageSize = page_size ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.ShoppingListShareWhereInput = {};
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

  const shoppingLists = await prisma.shoppingListShare.findMany({
    where: {
      ...where,
      user_kitchen_membership: {
        ...userKitchenMembershipWhere,
      },
    },
    include: {
      shopping_list: true,
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

  const hasNextPage = shoppingLists.length > actualPageSize;
  const resultsData = shoppingLists.splice(0, actualPageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
