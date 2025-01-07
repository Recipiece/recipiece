import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

/**
 * Allow a user who has been targeted by a membership to delete it.
 * We don't allow the source user to delete it to avoid them just spamming another user.
 */
export const deleteUserKitchenMembership = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const entityId = +request.params.id;
  const existingInvitation = await prisma.userKitchenMembership.findFirst({
    where: {
      destination_user_id: request.user.id,
      id: entityId,
    },
  });

  if (!existingInvitation) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "No invitation found",
      },
    ];
  }

  try {
    await prisma.userKitchenMembership.delete({
      where: {
        id: entityId,
        destination_user_id: request.user.id,
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