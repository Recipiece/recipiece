import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

/**
 * Allow a user to delete a membership
 */
export const deleteUserKitchenMembership = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const entityId = +request.params.id;
  const existingInvitation = await prisma.userKitchenMembership.findFirst({
    where: {
      OR: [{ destination_user_id: request.user.id }, { source_user_id: request.user.id }],
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
        id: existingInvitation.id,
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
