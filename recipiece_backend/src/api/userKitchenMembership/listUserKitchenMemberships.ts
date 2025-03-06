import { Constant } from "@recipiece/constant";
import { Prisma, PrismaTransaction, UserKitchenMembershipStatus } from "@recipiece/database";
import { ListUserKitchenMembershipsQuerySchema, ListUserKitchenMembershipsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { UserKitchenInvitationStatus } from "../../util/constant";

export const listUserKitchenMemberships = async (
  request: AuthenticatedRequest<any, ListUserKitchenMembershipsQuerySchema>,
  tx: PrismaTransaction
): ApiResponse<ListUserKitchenMembershipsResponseSchema> => {
  const {
    targeting_self,
    from_self,
    page_number,
    page_size,
    status = UserKitchenInvitationStatus.ALL_STATUSES,
    entity_filter,
    entity_id,
    entity_type,
  } = request.query;

  const actualPageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;

  const where: Prisma.UserKitchenMembershipWhereInput = {};

  if (targeting_self === true && from_self === true) {
    where.OR = [
      {
        destination_user_id: request.user.id,
      },
      {
        source_user_id: request.user.id,
      },
    ];
  } else if (from_self === true) {
    where.source_user_id = request.user.id;
  } else if (targeting_self === true) {
    where.destination_user_id = request.user.id;
  }

  if (status) {
    where.status = {
      in: status as UserKitchenMembershipStatus[],
    };
  }

  if (entity_filter && entity_id && entity_type) {
    switch (entity_type) {
      case "shopping_list":
        if (entity_filter === "include") {
          where.shopping_list_shares = {
            some: {
              shopping_list_id: entity_id,
            },
          };
        } else if (entity_filter === "exclude") {
          where.shopping_list_shares = {
            none: {
              shopping_list_id: entity_id,
            },
          };
        }
        break;
      case "recipe":
        if (entity_filter === "include") {
          where.recipe_shares = {
            some: {
              recipe_id: entity_id,
            },
          };
        } else if (entity_filter === "exclude") {
          where.recipe_shares = {
            none: {
              recipe_id: entity_id,
            },
          };
        }
        break;
      case "meal_plan":
        if (entity_filter === "include") {
          where.meal_plan_shares = {
            some: {
              meal_plan_id: entity_id,
            },
          };
        } else if (entity_filter === "exclude") {
          where.meal_plan_shares = {
            none: {
              meal_plan_id: entity_id,
            },
          };
        }
        break;
      case "cookbook":
        if (entity_filter === "include") {
          where.cookbook_shares = {
            some: {
              cookbook_id: entity_id,
            },
          };
        } else if (entity_filter === "exclude") {
          where.cookbook_shares = {
            none: {
              cookbook_id: entity_id,
            },
          };
        }
        break;
      default:
        return [
          StatusCodes.BAD_REQUEST,
          {
            message: "Unknown entity type",
          },
        ];
    }
  }

  const offset = page_number * actualPageSize;
  const memberships = await tx.userKitchenMembership.findMany({
    where: where,
    include: {
      source_user: true,
      destination_user: true,
    },
    skip: offset,
    take: actualPageSize + 1,
    orderBy: {
      created_at: "desc",
    },
  });

  const hasNextPage = memberships.length > actualPageSize;
  const resultsData = memberships.splice(0, actualPageSize);

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
