import { StatusCodes } from "http-status-codes";
import { prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteCookbook = async (req: AuthenticatedRequest): ApiResponse<{}> => {
  const user = req.user;
  const cookbookId = +req.params.id;

  const cookbook = await prisma.cookbook.findFirst({
    where: {
      user_id: user.id,
      id: cookbookId,
    },
  });

  if (!cookbook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook not found",
      },
    ];
  }

  await prisma.$transaction(async (tx) => {
    await tx.cookbook.delete({
      where: {
        id: cookbookId,
      },
    });
  });

  return [StatusCodes.OK, {}];
};
