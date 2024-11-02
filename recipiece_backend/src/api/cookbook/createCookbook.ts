import { Prisma, User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { CookBookSchema, CreateCookBookSchema, YCreateCookBookSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const createCookBook = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runCreateCookBook(req.user, req.body);
  res.status(statusCode).send(response);
};

const runCreateCookBook = async (user: User, body: any): ApiResponse<CookBookSchema> => {
  let cookBookBody: CreateCookBookSchema;
  try {
    cookBookBody = await YCreateCookBookSchema.validate(body);
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
    const createInput: Prisma.CookBookCreateInput = {
      name: cookBookBody.name,
      description: cookBookBody.description,
      user: {
        connect: {
          id: user.id,
        },
      },
    };

    const cookBook = await prisma.cookBook.create({
      data: {
        ...createInput,
      },
    });
    return [StatusCodes.OK, cookBook];
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
