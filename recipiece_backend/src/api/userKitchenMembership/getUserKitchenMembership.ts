import { PrismaTransaction } from "@recipiece/database";
import { UserKitchenMembershipSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getUserKitchenMembership = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<UserKitchenMembershipSchema> => {
  const membershipId = +request.params.id;
  const user = request.user;

  const membership = await tx.userKitchenMembership.findFirst({
    where: {
      OR: [{ source_user_id: user.id }, { destination_user_id: user.id }],
      id: membershipId,
    },
    include: {
      source_user: true,
      destination_user: true,
    },
  });

  if (!membership) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Membership ${membershipId} not found`,
      },
    ];
  }

  return [StatusCodes.OK, membership];
};
