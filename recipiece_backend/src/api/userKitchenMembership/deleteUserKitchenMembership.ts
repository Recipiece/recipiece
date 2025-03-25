import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

/**
 * Allow a user to delete a membership
 */
export const deleteUserKitchenMembership = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const entityId = +request.params.id;
  const existingInvitation = await tx.userKitchenMembership.findFirst({
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

  await tx.userKitchenMembership.delete({
    where: {
      id: existingInvitation.id,
    },
  });
  return [StatusCodes.OK, {}];
};
