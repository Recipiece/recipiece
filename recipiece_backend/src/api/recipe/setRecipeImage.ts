import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { SetRecipeImageResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { Environment } from "../../util/environment";
import { s3 } from "../../util/s3";
import { getImageUrl } from "./util";

export const setRecipeImage = async (request: AuthenticatedRequest, tx: PrismaTransaction): ApiResponse<SetRecipeImageResponseSchema> => {
  const { user } = request;
  const { recipe_id } = request.body;

  const recipe = await tx.recipe.findUnique({
    where: {
      id: +recipe_id,
      user_id: user.id,
    },
  });

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipe_id} not found`,
      },
    ];
  }

  const file = request.file!;
  const extension = file.originalname.split(".").pop();
  const key = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.${extension}`;

  // upload the new recipe image
  const putObjectCommand = new PutObjectCommand({
    Body: file.buffer,
    Bucket: Environment.S3_BUCKET,
    Key: key,
    ACL: "public-read",
    ContentType: file.mimetype,
  });

  await s3.send(putObjectCommand);

  // kill the existing recipe image
  if (recipe.image_key) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: Environment.S3_BUCKET,
        Key: recipe.image_key,
      });
      await s3.send(deleteCommand);
    } catch (err) {
      console.error(err);
    }
  }

  await tx.recipe.update({
    where: {
      id: +recipe_id,
    },
    data: {
      image_key: key,
    },
  });

  return [
    StatusCodes.OK,
    {
      image_url: getImageUrl(key),
    },
  ];
};
