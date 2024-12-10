import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { RevokeShareRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const revokeShoppingListShare = async (
  request: AuthenticatedRequest<RevokeShareRequestSchema>
): ApiResponse<{}> => {
  const { user: userToRevokeIdentifier, entity_id } = request.body;

  try {
    await prisma.$transaction(async (tx) => {
      const userToRevoke = await tx.user.findUniqueOrThrow({
        where: {
          email: userToRevokeIdentifier,
        },
      });
      await tx.shoppingListShare.deleteMany({
        where: {
          owner_user_id: request.user.id,
          shared_with_user_id: userToRevoke.id,
          shopping_list_id: entity_id,
        },
      });
    });
    return [StatusCodes.OK, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Unable to remove share",
      },
    ];
  }
};
