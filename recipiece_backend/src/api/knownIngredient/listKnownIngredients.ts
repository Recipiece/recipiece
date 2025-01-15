import { ListKnownIngredientsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ApiResponse } from "../../types";

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
