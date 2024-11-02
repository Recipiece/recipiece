import { Prisma, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CookBookSchema, UpdateCookBookSchema, UpdateRecipeSchema, YUpdateCookBookSchema, YUpdateRecipeSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const updateCookbook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runUpdateCookbook(req.user, req.body);
  res.status(statusCode).send(response);
};

const runUpdateCookbook = async (user: User, body: any): ApiResponse<CookBookSchema> => {
  let cookbookBody: UpdateCookBookSchema;
  try {
    cookbookBody = await YUpdateCookBookSchema.validate(body);
  } catch (error) {
    console.error(error);
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to update a cookbook",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

  const cookbook = await prisma.cookBook.findUnique({
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

    const updatedCookbook = await prisma.cookBook.update({
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
