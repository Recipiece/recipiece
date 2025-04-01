import { PrismaTransaction } from "@recipiece/database";
import { CookbookSchema, YCookbookSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { getCookbookByIdQuery } from "./query";

export const getCookbook = async (req: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<CookbookSchema> => {
  const user = req.user;
  const cookbookId = +req.params.id;

  const cookbook = await getCookbookByIdQuery(tx, user, cookbookId).executeTakeFirst();

  if (!cookbook) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: "Cookbook not found",
      },
    ];
  }

  return [StatusCodes.OK, YCookbookSchema.cast(cookbook)];
};
