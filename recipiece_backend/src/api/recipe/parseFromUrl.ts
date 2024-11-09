import { User } from "@prisma/client";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateRecipeFromURLSchema, ParsedFromURLRecipe, RecipeIngredientSchema, RecipeSchema, YCreateRecipeFromURLSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";

export const parseRecipeFromUrl = async (req: AuthenticatedRequest, res: Response) => {
  const [statusCode, response] = await runParseRecipeFromUrl(req.user, req.body);
  res.status(statusCode).send(response);
};

const runParseRecipeFromUrl = async (user: User, body: any): ApiResponse<RecipeSchema> => {
  let recipeBody: CreateRecipeFromURLSchema;
  try {
    recipeBody = await YCreateRecipeFromURLSchema.validate(body);
  } catch (error) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Invalid request to create a recipe",
        errors: (error as { errors: any[] })?.errors || [],
      },
    ];
  }

  try {
    const url = `${process.env.APP_RECIPE_PARSER_SERVICE_URL!}/recipe/parse`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        ...recipeBody,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseBody = (await response.json()) as ParsedFromURLRecipe;

    if (response.ok) {
      const steps = (responseBody.instructions_list || []).map((content, index) => {
        return {
          content: content,
          order: index,
        };
      });

      const ingredients = (responseBody.parsed_ingredients || []).map((parsedIng, index) => {
        return {
          ...parsedIng,
          order: index,
        };
      });

      return [
        StatusCodes.OK,
        <RecipeSchema>{
          name: responseBody.title,
          description: responseBody.description,
          ingredients: [...ingredients],
          steps: [...steps],
        },
      ];
    } else {
      console.error("failed to parse recipe", responseBody);
      return [
        StatusCodes.UNPROCESSABLE_ENTITY,
        {
          message: "Unable to parse recipe",
        },
      ];
    }
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.UNPROCESSABLE_ENTITY,
      {
        message: "Unable to parse recipe",
      },
    ];
  }
};
