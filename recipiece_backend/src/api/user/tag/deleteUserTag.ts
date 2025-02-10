import { prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { StatusCodes } from "http-status-codes";

export const deleteUserTag = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const tagId = +request.params.id;

  try {
    const tag = await prisma.userTag.findFirst({
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

    await prisma.userTag.delete({
      where: {
        id: tag.id,
      },
    });

    return [StatusCodes.OK, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to delete tag",
      },
    ];
  }
};
