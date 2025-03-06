import { PrismaTransaction } from "@recipiece/database";
import {
  CreateUserKitchenMembershipRequestSchema,
  UserKitchenInvitationStatus,
  UserKitchenMembershipSchema,
} from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

/**
 * Allows a user to invite another user to their kitchen, which opens up the gates for
 * sharing entities with that targeted user.
 *
 * Users can only send an invitation to another user once, to prevent spamming.
 */
export const createUserKitchenMembership = async (
  request: AuthenticatedRequest<CreateUserKitchenMembershipRequestSchema>,
  tx: PrismaTransaction
): ApiResponse<UserKitchenMembershipSchema> => {
  const targetUsername = request.body.username;
  const targetUser = await tx.user.findFirst({
    where: {
      username: {
        equals: targetUsername.trim(),
        mode: "insensitive",
      },
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

  const existingInvitation = await tx.userKitchenMembership.findFirst({
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

  const membership = await tx.userKitchenMembership.create({
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
      status: membership.status as
        | typeof UserKitchenInvitationStatus.PENDING
        | typeof UserKitchenInvitationStatus.ACCEPTED
        | typeof UserKitchenInvitationStatus.DENIED,
    },
  ];
};
