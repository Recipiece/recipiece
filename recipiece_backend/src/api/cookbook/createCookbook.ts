import { CookbookSchema, CreateCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { Prisma, PrismaTransaction } from "@recipiece/database";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ConflictError } from "../../util/error";

export const createCookbook = async (req: AuthenticatedRequest<CreateCookbookRequestSchema>, tx: PrismaTransaction): ApiResponse<CookbookSchema> => {
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

    const cookbook = await tx.cookbook.create({
      data: {
        ...createInput,
      },
    });
    return [StatusCodes.OK, cookbook];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      throw new ConflictError("You already have a cook book with this name");
    }
    throw err;
  }
};
