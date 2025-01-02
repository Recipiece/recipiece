import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CreateUserKitchenMembershipRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { UserKitchenInvitationStatus } from "../../util/constant";

/**
 * Allows a user to invite another user to their kitchen, which opens up the gates for
 * sharing entities with that targeted user.
 *
 * Users can only send an invitation to another user once, to prevent spamming.
 */
export const createUserKitchenMembership = async (
  request: AuthenticatedRequest<CreateUserKitchenMembershipRequestSchema>
): ApiResponse<{}> => {
  const targetUsername = request.body.username;
  const targetUser = await prisma.user.findFirst({
    where: {
      username: targetUsername,
    },
  });

  if (!targetUser) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `User ${targetUsername} not found`,
      },
    ];
  }

  if (targetUser.id === request.user.id) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Cannot invite yourself to your own kitchen",
      },
    ];
  }

  const existingInvitation = await prisma.userKitchenMembership.findFirst({
    where: {
      destination_user_id: targetUser.id,
      source_user_id: request.user.id,
    },
  });

  if (existingInvitation) {
    return [
      StatusCodes.TOO_MANY_REQUESTS,
      {
        message: `An invitation to ${targetUsername} already exists`,
      },
    ];
  }

  try {
    await prisma.userKitchenMembership.create({
      data: {
        source_user_id: request.user.id,
        destination_user_id: targetUser.id,
        status: UserKitchenInvitationStatus.PENDING,
      },
    });
    return [StatusCodes.OK, {}];
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
