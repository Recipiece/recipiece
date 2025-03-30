import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { prisma, User } from "@recipiece/database";
import { generateRecipe, generateRecipeWithIngredientsAndSteps, generateUserKitchenMembership } from "@recipiece/test";
import { RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { readFileSync } from "node:fs";
import path from "node:path";
import request from "supertest";
import { Environment } from "../../../src/util/environment";
import { s3 } from "../../../src/util/s3";

describe("Fork Recipe", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should clone the recipe with ingredients and steps", async () => {
    const originalRecipe = await generateRecipeWithIngredientsAndSteps({
      user_id: otherUser.id,
    });
    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: originalRecipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    const createdRecipe = response.body as RecipeSchema;

    expect(createdRecipe.id).not.toBe(originalRecipe.id);
    expect(createdRecipe.description).toEqual(originalRecipe.description);
    expect(createdRecipe.duration_ms).toEqual(originalRecipe.duration_ms);
    expect(createdRecipe.servings).toEqual(originalRecipe.servings);

    expect(createdRecipe.ingredients?.length).toBe(originalRecipe.ingredients.length);
    expect(createdRecipe.steps?.length).toBe(originalRecipe.steps.length);

    const createdOrderedIngredients = createdRecipe.ingredients!.sort((a, b) => a.order - b.order);
    const originalOrderedIngredients = originalRecipe.ingredients.sort((a, b) => a.order - b.order);
    for (let i = 0; i < createdOrderedIngredients.length; i++) {
      expect(createdOrderedIngredients[i].name).toEqual(originalOrderedIngredients[i].name);
      expect(createdOrderedIngredients[i].amount).toEqual(originalOrderedIngredients[i].amount);
      expect(createdOrderedIngredients[i].unit).toEqual(originalOrderedIngredients[i].unit);
    }

    const createdOrderedSteps = createdRecipe.steps!.sort((a, b) => a.order - b.order);
    const originalOrderedSteps = originalRecipe.steps.sort((a, b) => a.order - b.order);
    for (let i = 0; i < createdOrderedSteps.length; i++) {
      expect(createdOrderedSteps[i].content).toEqual(originalOrderedSteps[i].content);
    }
  });

  it("should not allow you to fork another users unshared recipe", async () => {
    const recipe = await generateRecipe({
      user_id: otherUser.id,
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should allow you to fork a recipe that has been shared with you", async () => {
    const recipe = await generateRecipe({
      user_id: otherUser.id,
    });
    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.CREATED);

    const forkedRecipe = await prisma.recipe.findFirst({
      where: {
        name: recipe.name,
        user_id: user.id,
      },
    });

    expect(forkedRecipe).toBeTruthy();
  });

  it("should not allow you to fork a recipe from a non-accepted membership", async () => {
    const recipe = await generateRecipe({
      user_id: otherUser.id,
    });
    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "pending",
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow you to fork a recipe that does not exist", async () => {
    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: 100000000,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow a user to fork their own recipe", async () => {
    const recipe = await generateRecipe({
      user_id: user.id,
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should copy the image to the requesting users key", async () => {
    const filePath = path.join(__dirname, "../../test_files/test_image.png");
    const originalRecipe = await generateRecipe({
      user_id: otherUser.id,
    });

    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, originalRecipe.id)}.png`;

    await prisma.recipe.update({
      where: { id: originalRecipe.id },
      data: { image_key: expectedKey },
    });

    const putObjectCommand = new PutObjectCommand({
      Body: readFileSync(filePath),
      Bucket: Environment.S3_BUCKET,
      Key: expectedKey,
      ContentType: "image/png",
    });
    await s3.send(putObjectCommand);

    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: originalRecipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    const responseBody: RecipeSchema = response.body;
    expect(responseBody.image_url).toBeTruthy();

    const createdRecipe = await prisma.recipe.findFirst({
      where: { id: responseBody.id },
    });
    expect(createdRecipe?.image_key).toBeTruthy();

    const getObjectCommand = new GetObjectCommand({
      Bucket: Environment.S3_BUCKET,
      Key: createdRecipe!.image_key!,
    });
    const getObjectResponse = await s3.send(getObjectCommand);
    expect(getObjectResponse.Body).toBeTruthy();
  });

  it("should not copy the image when the original user does not allow that", async () => {
    const filePath = path.join(__dirname, "../../test_files/test_image.png");
    const originalRecipe = await generateRecipe({
      user_id: otherUser.id,
    });

    await prisma.user.update({
      where: {
        id: otherUser.id,
      },
      data: {
        preferences: {
          forking_image_permission: "denied",
        },
      },
    });

    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, originalRecipe.id)}.png`;

    await prisma.recipe.update({
      where: { id: originalRecipe.id },
      data: { image_key: expectedKey },
    });

    const putObjectCommand = new PutObjectCommand({
      Body: readFileSync(filePath),
      Bucket: Environment.S3_BUCKET,
      Key: expectedKey,
      ContentType: "image/png",
    });
    await s3.send(putObjectCommand);

    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: originalRecipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    const responseBody: RecipeSchema = response.body;
    expect(responseBody.image_url).toBeFalsy();

    const createdRecipe = await prisma.recipe.findFirst({
      where: { id: responseBody.id },
    });
    expect(createdRecipe?.image_key).toBeFalsy();

    const getObjectCommand = new GetObjectCommand({
      Bucket: Environment.S3_BUCKET,
      Key: createdRecipe!.image_key!,
    });
    expect(() => s3.send(getObjectCommand)).rejects.toThrow();
  });
});
