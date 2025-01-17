import { ListKnownIngredientsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../types";
import { prisma } from "@recipiece/database";

export const listKnownIngredients = async (): ApiResponse<ListKnownIngredientsResponseSchema> => {
  const ingredients = await prisma.knownIngredient.findMany({
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
