import { PrismaTransaction } from "@recipiece/database";
import { ParsedFromURLRecipe, ParseRecipeFromURLRequestSchema, ParseRecipeFromURLResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { UnprocessableEntityError } from "../../util/error";

export const parseRecipeFromUrl = async (req: AuthenticatedRequest<ParseRecipeFromURLRequestSchema>, _: PrismaTransaction): ApiResponse<ParseRecipeFromURLResponseSchema> => {
  const recipeBody = req.body;

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
        {
          name: responseBody.title!,
          description: responseBody.description,
          ingredients: [...ingredients],
          steps: [...steps],
        },
      ];
    } else {
      console.error("failed to parse recipe", responseBody);
      throw new UnprocessableEntityError("Unable to parse recipe");
    }
  } catch (err) {
    console.error(err);
    throw new UnprocessableEntityError("Unable to parse recipe");
  }
};
