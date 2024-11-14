import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CookbookSchema, UpdateCookbookRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateCookbook = async (req: AuthenticatedRequest<UpdateCookbookRequestSchema>): ApiResponse<CookbookSchema> => {
  const cookbookBody = req.body;
  const user = req.user;

  const cookbook = await prisma.cookbook.findUnique({
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

  try {
    const { id, ...restData } = cookbookBody;

    const updatedCookbook = await prisma.cookbook.update({
      // @ts-ignore
      data: {
        ...restData,
      },
      where: {
        id: id,
      },
    });
    return [StatusCodes.OK, updatedCookbook];
  } catch (error) {
    console.error(error);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to update recipe",
      },
    ];
  }
};
