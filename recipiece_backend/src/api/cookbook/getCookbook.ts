import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CookbookSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const getCookbook = async (req: AuthenticatedRequest): ApiResponse<CookbookSchema> => {
  const user = req.user;
  const cookbookId = +req.params.id;

  const cookbook = await prisma.cookbook.findFirst({
    where: {
      id: cookbookId,
      user_id: user.id,
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

  return [StatusCodes.OK, cookbook];
};
