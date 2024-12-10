import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { GrantShareRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const grantShoppingListShare = async (request: AuthenticatedRequest<GrantShareRequestSchema>): ApiResponse<{}> => {
  const { user: shareToUserIdentifierString, entity_id } = request.body;

  try {
    await prisma.$transaction(async (tx) => {
      const shareToUser = await tx.user.findFirstOrThrow({
        where: {
          email: shareToUserIdentifierString,
        },
      });
      await tx.shoppingListShare.create({
        data: {
          owner_user_id: request.user.id,
          shared_with_user_id: shareToUser.id,
          shopping_list_id: entity_id,
        },
      });
    });
    return [StatusCodes.CREATED, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Unable to share shopping list",
      },
    ];
  }
};
