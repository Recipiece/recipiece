import { Prisma } from "@prisma/client";
import { ListUserKitchenMembershipsQuerySchema, ListUserKitchenMembershipsResponseSchema, UserKitchenMembershipSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { DEFAULT_PAGE_SIZE, UserKitchenInvitationStatus } from "../../util/constant";
import { prisma } from "../../database";
import { StatusCodes } from "http-status-codes";

export const listUserKitchenMemberships = async (
  request: AuthenticatedRequest<any, ListUserKitchenMembershipsQuerySchema>
): ApiResponse<ListUserKitchenMembershipsResponseSchema> => {
  const {
    targeting_self,
    from_self,
    page_number,
    page_size,
    status = UserKitchenInvitationStatus.ALL_STATUSES,
  } = request.query;

  const actualPageSize = page_size ?? DEFAULT_PAGE_SIZE;

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
      in: status as string[],
    };
  }

  const offset = page_number * actualPageSize;
  const memberships = await prisma.userKitchenMembership.findMany({
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
      data: resultsData as UserKitchenMembershipSchema[],
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
