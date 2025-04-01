import { PrismaTransaction } from "@recipiece/database";
import { ListKnownIngredientsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const listKnownIngredients = async (_: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<ListKnownIngredientsResponseSchema> => {
  const ingredients = await tx.knownIngredient.findMany({
    orderBy: {
      ingredient_name: "asc",
    },
  });

  return [
    StatusCodes.OK,
    {
      data: ingredients,
    },
  ];
};
