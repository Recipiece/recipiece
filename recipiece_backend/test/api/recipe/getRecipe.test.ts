import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { prisma, User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateRecipe, generateUserKitchenMembership } from "@recipiece/test";
import { RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { readFileSync } from "node:fs";
import path from "node:path";
import request from "supertest";
import { s3 } from "../../../src/util/s3";

describe("Get Recipe", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to get their own recipe", async () => {
    const existingRecipe = await generateRecipe({ user_id: user.id });

    const response = await request(server).get(`/recipe/${existingRecipe.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const recipeBody = response.body as RecipeSchema;
    expect(recipeBody.id).toEqual(existingRecipe.id);
  });

  it("should not retrieve a recipe that is not shared and does not belong to the requesting user", async () => {
    const otherRecipe = await generateRecipe();

    const response = await request(server).get(`/recipe/${otherRecipe.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a recipe that does not exist", async () => {
    const response = await request(server).get(`/recipe/5000`).set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it.each([true, false])("should get a recipe shared with a user when source user is user is %o", async (isUserSourceUser) => {
    const otherRecipe = await generateRecipe();
    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherRecipe.user_id,
      destination_user_id: isUserSourceUser ? otherRecipe.user_id : user.id,
      status: "accepted",
    });

    const response = await request(server).get(`/recipe/${otherRecipe.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: RecipeSchema = response.body;
    expect(responseData.user_kitchen_membership_id).toBe(membership.id);
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not get a shared recipe where the membership has status %o", async (membershipStatus) => {
    const otherRecipe = await generateRecipe();
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherRecipe.user_id,
        destination_user_id: user.id,
        status: membershipStatus,
      },
    });

    const response = await request(server).get(`/recipe/${otherRecipe.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should set an image url for the recipe", async () => {
    const recipe = await generateRecipe({ user_id: user.id });
    const expectedKey = `${Constant.RecipeImage.keyFor(user.id, recipe.id)}.png`;

    const putRequest = new PutObjectCommand({
      Bucket: process.env.APP_S3_BUCKET,
      Key: expectedKey,
      Body: readFileSync(path.join(__dirname, "../../test_files/test_image.png")),
    });
    await s3.send(putRequest);
    
  });
});
