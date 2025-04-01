import { PrismaTransaction } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const deleteCookbook = async (req: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<{}> => {
  const user = req.user;
  const cookbookId = +req.params.id;

  const cookbook = await tx.cookbook.findFirst({
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

  await tx.cookbook.delete({
    where: {
      id: cookbookId,
    },
  });

  return [StatusCodes.OK, {}];
};
