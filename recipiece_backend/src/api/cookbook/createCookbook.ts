import { CookbookSchema, CreateCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { Prisma, prisma } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createCookbook = async (req: AuthenticatedRequest<CreateCookbookRequestSchema>): ApiResponse<CookbookSchema> => {
  const cookbookBody = req.body;
  const user = req.user;

  try {
    const createInput: Prisma.CookbookCreateInput = {
      name: cookbookBody.name,
      description: cookbookBody.description,
      user: {
        connect: {
          id: user.id,
        },
      },
    };

    const cookbook = await prisma.cookbook.create({
      data: {
        ...createInput,
      },
    });
    return [StatusCodes.OK, cookbook];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      return [
        StatusCodes.CONFLICT,
        {
          message: "You already have a cook book with this name",
        },
      ];
    } else {
      console.error(err);
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to create recipe",
        },
      ];
    }
  }
};
