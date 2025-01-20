import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { CreateUserKitchenMembershipRequestSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { UserKitchenInvitationStatus } from "../../../util/constant";

/**
 * Allows a user to invite another user to their kitchen, which opens up the gates for
 * sharing entities with that targeted user.
 *
 * Users can only send an invitation to another user once, to prevent spamming.
 */
export const createUserKitchenMembership = async (request: AuthenticatedRequest<CreateUserKitchenMembershipRequestSchema>): ApiResponse<UserKitchenMembershipSchema> => {
  const targetUsername = request.body.username;
  const targetUser = await prisma.user.findFirst({
    where: {
      username: targetUsername,
      preferences: {
        path: ["account_visibility"],
        not: "private",
      },
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
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: request.user.id,
        destination_user_id: targetUser.id,
        status: UserKitchenInvitationStatus.PENDING,
      },
      include: {
        source_user: true,
        destination_user: true,
      },
    });
    return [
      StatusCodes.OK,
      {
        ...membership,
        status: membership.status as typeof UserKitchenInvitationStatus.PENDING | typeof UserKitchenInvitationStatus.ACCEPTED | typeof UserKitchenInvitationStatus.DENIED,
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
