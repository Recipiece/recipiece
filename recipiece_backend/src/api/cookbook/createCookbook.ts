import { Prisma, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CookbookSchema, CreateCookbookSchema, YCreateCookbookSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createCookbook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runCreateCookbook(req.user, req.body);
  res.status(statusCode).send(response);
};

const runCreateCookbook = async (user: User, body: any): ApiResponse<CookbookSchema> => {
  let cookbookBody: CreateCookbookSchema;
  try {
    cookbookBody = await YCreateCookbookSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to create a cookbook",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

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
