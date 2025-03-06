import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteUserTag = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const tagId = +request.params.id;

  const tag = await tx.userTag.findFirst({
    where: {
      user_id: request.user.id,
      id: tagId,
    },
  });

  if (!tag) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Tag ${tagId} not found`,
      },
    ];
  }

  await tx.userTag.delete({
    where: {
      id: tag.id,
    },
  });

  return [StatusCodes.OK, {}];
};
