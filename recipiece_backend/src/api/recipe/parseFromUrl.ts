import { PrismaTransaction } from "@recipiece/database";
import { ParsedFromURLRecipe, ParseRecipeFromURLRequestSchema, ParseRecipeFromURLResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { Environment } from "../../util/environment";
import { UnprocessableEntityError } from "../../util/error";

export const parseRecipeFromUrl = async (req: AuthenticatedRequest<ParseRecipeFromURLRequestSchema>, _: PrismaTransaction): ApiResponse<ParseRecipeFromURLResponseSchema> => {
  const recipeBody = req.body;

  try {
    const url = `${Environment.RECIPE_PARSER_SERVICE_URL}/recipe/parse`;
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
    const { parsed_ingredients, ...restParsedRecipe } = responseBody;

    if (response.ok) {
      const steps = (restParsedRecipe.instructions_list || []).map((content, index) => {
        return {
          content: content,
          order: index,
        };
      });

      const ingredients = (parsed_ingredients || []).map((parsedIng, index) => {
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
          external_image_url: restParsedRecipe.image,
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
