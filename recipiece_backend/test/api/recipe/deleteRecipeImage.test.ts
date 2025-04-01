import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { prisma, User } from "@recipiece/database";
import { generateRecipe } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import { readFileSync } from "node:fs";
import path from "node:path";
import request from "supertest";
import { Environment } from "../../../src/util/environment";
import { s3 } from "../../../src/util/s3";

describe("Delete Recipe Image", () => {
  let user: User;
  let bearerToken: string;
  const filePath = path.join(__dirname, "../../test_files/test_image.png");

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should delete the image for a recipe", async () => {
    const recipe = await generateRecipe({ user_id: user.id });
    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { image_key: expectedKey },
    });

    const putObjectCommand = new PutObjectCommand({
      Body: readFileSync(filePath),
      Bucket: Environment.S3_BUCKET,
      Key: expectedKey,
      ContentType: "image/png",
    });
    await s3.send(putObjectCommand);

    const response = await request(server).delete(`/recipe/image/${recipe.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const dbRecipe = await prisma.recipe.findFirst({
      where: { id: recipe.id },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe!.image_key).toBeFalsy();

    const getRequest = new GetObjectCommand({
      Bucket: Environment.S3_BUCKET,
      Key: expectedKey,
    });
    expect(() => s3.send(getRequest)).rejects.toThrow();
  });

  it("should return a 200 even if the image does not exist", async () => {
    const recipe = await generateRecipe({ user_id: user.id });
    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { image_key: expectedKey },
    });

    const response = await request(server).delete(`/recipe/image/${recipe.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const dbRecipe = await prisma.recipe.findFirst({
      where: { id: recipe.id },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe!.image_key).toBeFalsy();
  });

  it("should not allow another user to delete the image", async () => {
    const recipe = await generateRecipe();
    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { image_key: expectedKey },
    });

    const putObjectCommand = new PutObjectCommand({
      Body: readFileSync(filePath),
      Bucket: Environment.S3_BUCKET,
      Key: expectedKey,
      ContentType: "image/png",
    });
    await s3.send(putObjectCommand);

    const response = await request(server).delete(`/recipe/image/${recipe.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const dbRecipe = await prisma.recipe.findFirst({
      where: { id: recipe.id },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe!.image_key).toBeTruthy();

    const getRequest = new GetObjectCommand({
      Bucket: Environment.S3_BUCKET,
      Key: expectedKey,
    });
    const getResponse = await s3.send(getRequest);
    expect(getResponse.Body).toBeTruthy();
  });
});
