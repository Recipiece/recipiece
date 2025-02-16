import { CookbookSchema, UpdateCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { PrismaTransaction } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateCookbook = async (req: AuthenticatedRequest<UpdateCookbookRequestSchema>, tx: PrismaTransaction): ApiResponse<CookbookSchema> => {
  const cookbookBody = req.body;
  const user = req.user;

  const cookbook = await tx.cookbook.findUnique({
    where: {
      id: cookbookBody.id,
    },
  });

  if (!cookbook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Cookbook ${cookbookBody.id} not found`,
      },
    ];
  }

  if (cookbook.user_id !== user.id) {
    console.warn(`user ${user.id} attempted to update cookbook ${cookbook.id}`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Cookbook ${cookbookBody.id} not found`,
      },
    ];
  }

  const { id, ...restData } = cookbookBody;

  const updatedCookbook = await tx.cookbook.update({
    // @ts-ignore
    data: {
      ...restData,
    },
    where: {
      id: id,
    },
  });
  return [StatusCodes.OK, updatedCookbook];
};
