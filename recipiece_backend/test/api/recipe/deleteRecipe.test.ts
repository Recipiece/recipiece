import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { prisma, User } from "@recipiece/database";
import { generateRecipe } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import { readFileSync } from "node:fs";
import path from "node:path";
import request from "supertest";
import { s3 } from "../../../src/util/s3";

describe("Delete Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to delete their recipe", async () => {
    const recipe = await generateRecipe({ user_id: user.id });

    const response = await request(server).delete(`/recipe/${recipe.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const deletedRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipe.id,
      },
    });
    expect(deletedRecipe).toBeFalsy();
  });

  it("should not allow a user to delete a recipe they do not own", async () => {
    const recipe = await generateRecipe();

    const response = await request(server).delete(`/recipe/${recipe.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const deletedRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipe.id,
      },
    });
    expect(deletedRecipe).toBeTruthy();
  });

  it(`should ${StatusCodes.NOT_FOUND} when the recipe does not exist`, async () => {
    const response = await request(server).delete("/recipe/5000").set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should delete the image for a recipe", async () => {
    const recipe = await generateRecipe({
      user_id: user.id,
    });
    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;

    const putRequest = new PutObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: expectedKey,
      Body: readFileSync(path.join(__dirname, "../../test_files/test_image.png")),
    });
    await s3.send(putRequest);

    await prisma.recipe.update({
      where: {
        id: recipe.id,
      },
      data: {
        image_key: expectedKey,
      }
    })

    const response = await request(server).delete(`/recipe/${recipe.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`).send();
    expect(response.statusCode).toBe(StatusCodes.OK);

    const getRequest = new GetObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: expectedKey,
    });
    expect(() => s3.send(getRequest)).rejects.toThrow();
  });
});
