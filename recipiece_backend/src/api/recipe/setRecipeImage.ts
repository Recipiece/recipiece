import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { PrismaTransaction } from "@recipiece/database";
import { SetRecipeImageRequestSchema, YSetRecipeImageRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { s3 } from "../../util/s3";


export const setRecipeImage = async (request: AuthenticatedRequest<SetRecipeImageRequestSchema>, tx: PrismaTransaction): ApiResponse<{}> => {
  const { user } = request;
  const { recipe_id } = YSetRecipeImageRequestSchema.cast(request.body);

  const recipe = await tx.recipe.findUnique({
    where: {
      id: recipe_id,
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

  const putObjectCommand = new PutObjectCommand({
    Body: file.buffer,
    Bucket: process.env.APP_S3_BUCKET,
    Key: key,
    ContentType: file.mimetype,
  });

  await s3.send(putObjectCommand);
  await tx.recipe.update({
    where: {
      id: recipe_id,
    },
    data: {
      image_key: key,
    },
  });

  return [StatusCodes.OK, {}];
};
