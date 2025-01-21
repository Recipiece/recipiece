import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { SetUserKitchenMembershipStatusRequestSchema, SetUserKitchenMembershipStatusResponseSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { UserKitchenInvitationStatus } from "../../../util/constant";

/**
 * Allow the currently authenticated user to set the status of a membership that is targeting them.
 * The requesting user can flip the status to confirmed or denied at any time they feel.
 */
export const setUserKitchenMembershipStatus = async (
  request: AuthenticatedRequest<SetUserKitchenMembershipStatusRequestSchema>
): ApiResponse<SetUserKitchenMembershipStatusResponseSchema> => {
  const { id, status } = request.body;

  const membership = await prisma.userKitchenMembership.findFirst({
    where: {
      id: id,
      destination_user_id: request.user.id,
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

  try {
    const updatedRecord = await prisma.userKitchenMembership.update({
      where: {
        id: id,
        destination_user_id: request.user.id,
      },
      data: {
        status: status,
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
        status: updatedRecord.status as typeof UserKitchenInvitationStatus.ACCEPTED | typeof UserKitchenInvitationStatus.DENIED,
      },
    ];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Internal server error",
      },
    ];
  }
};
