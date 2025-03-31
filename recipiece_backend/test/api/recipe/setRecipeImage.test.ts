import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { prisma, User } from "@recipiece/database";
import { generateRecipe } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import request from "supertest";
import { Environment } from "../../../src/util/environment";
import { s3 } from "../../../src/util/s3";

describe("Set Recipe Image", () => {
  let user: User;
  let bearerToken: string;
  const filePath = path.join(__dirname, "../../test_files/test_image.png");

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should set the recipe image", async () => {
    const recipe = await generateRecipe({ user_id: user.id });

    await request(server)
      .post("/recipe/image")
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "multipart/form-data")
      .field("recipe_id", recipe.id)
      .attach("file", filePath)
      .expect(StatusCodes.OK);

    const dbRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipe.id,
      },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe?.image_key).toBeTruthy();

    const getRequest = new GetObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: dbRecipe?.image_key!,
    });
    const response = await s3.send(getRequest);
    expect(response.Body).toBeTruthy();
  });

  it("should not allow another user to set the recipe image", async () => {
    const recipe = await generateRecipe();

    await request(server)
      .post("/recipe/image")
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "multipart/form-data")
      .field("recipe_id", recipe.id)
      .attach("file", filePath)
      .expect(StatusCodes.NOT_FOUND);

    const dbRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipe.id,
      },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe?.image_key).toBeFalsy();

    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;
    const getRequest = new GetObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: expectedKey,
    });
    expect(() => s3.send(getRequest)).rejects.toThrow();
  });

  it("should do nothing when a recipe does not exist", async () => {
    await request(server)
      .post("/recipe/image")
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "multipart/form-data")
      .field("recipe_id", 100000000)
      .attach("file", filePath)
      .expect(StatusCodes.NOT_FOUND);

    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, 100000000)}.png`;
    const getRequest = new GetObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: expectedKey,
    });
    expect(() => s3.send(getRequest)).rejects.toThrow();
  });

  it("should not accept a file that is too large", async () => {
    const recipe = await generateRecipe({ user_id: user.id });

    const largeTempFilePath = path.join(__dirname, "../../test_files/large-test-file.png");
    const largeFileContent = "x".repeat(Constant.RecipeImage.MAX_FILE_SIZE_BYTES + 1);
    writeFileSync(largeTempFilePath, largeFileContent);

    await request(server)
      .post("/recipe/image")
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "multipart/form-data")
      .field("recipe_id", recipe.id)
      .attach("file", largeTempFilePath)
      .expect(StatusCodes.REQUEST_TOO_LONG);

    const dbRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipe.id,
      },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe?.image_key).toBeFalsy();

    unlinkSync(largeTempFilePath);

    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;
    const getRequest = new GetObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: expectedKey,
    });
    expect(() => s3.send(getRequest)).rejects.toThrow();
  });

  it("should not accept a file with an unsupported file format", async () => {
    const recipe = await generateRecipe({ user_id: user.id });

    const badExtensionFile = path.join(__dirname, "../../test_files/extension-file.exe");
    writeFileSync(badExtensionFile, "asdfqwerasdfqwer");

    await request(server)
      .post("/recipe/image")
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "multipart/form-data")
      .field("recipe_id", recipe.id)
      .attach("file", badExtensionFile)
      .expect(StatusCodes.BAD_REQUEST);

    const dbRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipe.id,
      },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe?.image_key).toBeFalsy();

    unlinkSync(badExtensionFile);

    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;
    const getRequest = new GetObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: expectedKey,
    });
    expect(() => s3.send(getRequest)).rejects.toThrow();
  });

  it("should delete an existing image", async () => {
    const recipe = await generateRecipe({ user_id: user.id });
    const oldKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { image_key: oldKey },
    });

    const putObjectCommand = new PutObjectCommand({
      Body: readFileSync(filePath),
      Bucket: Environment.S3_BUCKET,
      Key: oldKey,
      ContentType: "image/png",
    });
    await s3.send(putObjectCommand);

    await request(server)
      .post("/recipe/image")
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "multipart/form-data")
      .field("recipe_id", recipe.id)
      .attach("file", filePath)
      .expect(StatusCodes.OK);

    const dbRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipe.id,
      },
    });
    expect(dbRecipe).toBeTruthy();
    expect(dbRecipe?.image_key).toBeTruthy();

    const getRequest = new GetObjectCommand({
      Bucket: Environment.S3_BUCKET,
      Key: dbRecipe?.image_key!,
    });
    const response = await s3.send(getRequest);
    expect(response.Body).toBeTruthy();

    const oldGetRequest = new GetObjectCommand({
      Bucket: Environment.S3_BUCKET,
      Key: oldKey,
    });
    expect(() => s3.send(oldGetRequest)).rejects.toThrow();
  });
});
