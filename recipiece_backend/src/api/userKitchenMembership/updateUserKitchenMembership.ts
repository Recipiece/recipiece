import { PrismaTransaction } from "@recipiece/database";
import {
  UpdateUserKitchenMembershipRequestSchema,
  UserKitchenInvitationStatus,
  UserKitchenMembershipSchema,
} from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

/**
 * Allow the currently authenticated user to set the status of a membership that is targeting them.
 * The requesting user can flip the status to confirmed or denied at any time they feel.
 */
export const updateUserKitchenMembership = async (
  request: AuthenticatedRequest<UpdateUserKitchenMembershipRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<UserKitchenMembershipSchema> => {
  const { id, status, grant_level } = request.body;

  const membership = await tx.userKitchenMembership.findFirst({
    where: {
      id: id,
      OR: [
        {
          destination_user_id: request.user.id,
        },
        {
          source_user_id: request.user.id,
        },
      ],
    },
  });

  if (!membership) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Invitation not found",
      },
    ];
  }

  if (status && status !== membership.status && membership.destination_user_id !== request.user.id) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Cannot change the status of a membership you created",
      },
    ];
  }

  const updatedRecord = await tx.userKitchenMembership.update({
    where: {
      id: id,
    },
    data: {
      status: status ?? membership.status,
      grant_level: grant_level ?? membership.grant_level,
    },
    include: {
      destination_user: true,
      source_user: true,
    },
  });

  return [
    StatusCodes.OK,
    {
      ...updatedRecord,
      status: updatedRecord.status as
        | typeof UserKitchenInvitationStatus.ACCEPTED
        | typeof UserKitchenInvitationStatus.DENIED,
    },
  ];
};
