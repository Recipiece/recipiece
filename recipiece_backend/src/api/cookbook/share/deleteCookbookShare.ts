import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const deleteCookbookShare = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const shareId = +request.params.id;

  const share = await tx.cookbookShare.findFirst({
    where: {
      id: shareId,
      user_kitchen_membership: {
        source_user_id: request.user.id,
      },
      cookbook: {
        user_id: request.user.id,
      },
    },
  });

  if (!share) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Cookbook share ${shareId} not found`,
      },
    ];
  }

  await tx.cookbookShare.delete({
    where: {
      id: share.id,
    },
  });
  return [StatusCodes.OK, {}];
};
