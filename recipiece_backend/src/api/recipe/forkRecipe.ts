import { CopyObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { ForkRecipeRequestSchema, RecipeSchema, YUserPreferencesSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { Environment } from "../../util/environment";
import { s3 } from "../../util/s3";
import { getRecipeByIdQuery } from "./query";

export const forkRecipe = async (request: AuthenticatedRequest<ForkRecipeRequestSchema>, tx: PrismaTransaction): ApiResponse<RecipeSchema> => {
  const { original_recipe_id } = request.body;
  const user = request.user;
  const originalRecipe = await getRecipeByIdQuery(tx, user, original_recipe_id).executeTakeFirst();

  if (!originalRecipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${original_recipe_id} not found.`,
      },
    ];
  }

  if (originalRecipe.user_id === user.id) {
    return [
      StatusCodes.BAD_REQUEST,
      {
        message: "Cannot fork your own recipe",
      },
    ];
  }

  const originalUser = await tx.user.findFirst({
    where: {
      id: originalRecipe.user_id,
    },
  });

  if (!originalUser) {
    console.warn(`recipe ${original_recipe_id} has no user! this really should be impossible.`);
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${original_recipe_id} not found.`,
      },
    ];
  }

  const { id, user_id, created_at, ingredients, metadata, steps, tags, image_key, user_kitchen_membership_id, ...restRecipe } = originalRecipe;
  const metadataCast = metadata as any;
  const idLessIngredients = (ingredients ?? []).map((ing) => {
    const { id, recipe_id, ...restIng } = ing;
    return restIng;
  });
  const idLessSteps = (steps ?? []).map((step) => {
    const { id, recipe_id, ...restStep } = step;
    return restStep;
  });

  let forkedRecipe: RecipeSchema = await tx.recipe.create({
    data: {
      ...restRecipe,
      user_id: user.id,
      metadata: {
        ...metadataCast,
        forks: [
          ...(metadataCast?.forks || []),
          {
            forked_on: DateTime.utc().toISO(),
            forked_from_recipe: originalRecipe.id,
            forked_from_user: originalRecipe.user_id,
            forked_by: user.id,
          },
        ],
      },
      ingredients: {
        createMany: {
          data: [...idLessIngredients],
        },
      },
      steps: {
        createMany: {
          data: [...idLessSteps],
        },
      },
    },
    include: {
      steps: true,
      ingredients: true,
    },
  });

  const originalUserPrefs = YUserPreferencesSchema.cast(originalUser.preferences);

  // clone the image too, if there is one, and the original user allows it
  if (image_key && originalUserPrefs.forking_image_permission === "allowed") {
    const fileExtension = image_key.split(".").pop();
    const newKey = `${Constant.RecipeImage.keyFor(user.id, forkedRecipe.id)}.${fileExtension}`;

    const copyObjectCommand = new CopyObjectCommand({
      Bucket: Environment.S3_BUCKET,
      CopySource: `${Environment.S3_BUCKET}/${image_key}`,
      Key: newKey,
    });

    try {
      await s3.send(copyObjectCommand);

      const updatedRecipe = await tx.recipe.update({
        where: { id: forkedRecipe.id },
        data: { image_key: newKey },
      });
      forkedRecipe = {
        ...forkedRecipe,
        image_url: `${Environment.S3_CDN_ENDPOINT}/${Environment.S3_BUCKET}/${updatedRecipe.image_key}`,
      };
    } catch (err) {
      console.error(err);
    }
  }

  return [StatusCodes.CREATED, forkedRecipe];
};
