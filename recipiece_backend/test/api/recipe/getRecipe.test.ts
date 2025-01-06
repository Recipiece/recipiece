import { User } from "@prisma/client";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { GetRecipeResponseSchema, RecipeSchema } from "../../../src/schema";
import { prisma } from "../../../src/database";

describe("Get Recipe", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to get a recipe", async () => {
    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "asdfqwer",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .get(`/recipe/${existingRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const recipeBody = response.body as RecipeSchema;
    expect(recipeBody.id).toEqual(existingRecipe.id);
  });

  it("should not retrieve a recipe that is not shared and does not belong to the requesting user", async () => {
    const [otherUser] = await fixtures.createUserAndToken({ email: "otheruser@recipiece.org" });
    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "asdfqwer",
        user_id: otherUser.id,
      },
    });

    const response = await request(server)
      .get(`/recipe/${existingRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a recipe that does not exist", async () => {
    const response = await request(server).get(`/recipe/5000`).set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should get a shared recipe", async () => {
    const [otherUser] = await fixtures.createUserAndToken({ email: "otheruser@recipiece.org" });
    const othersRecipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "asdfqwer",
        user_id: otherUser.id,
      },
    });

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "accepted",
      },
    });

    const share = await prisma.recipeShare.create({
      data: {
        recipe_id: othersRecipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    // make a membership and share going the other way to ensure we dont pick up stray records
    const mirroredMembership = await prisma.userKitchenMembership.create({
      data: {
        destination_user_id: otherUser.id,
        source_user_id: user.id,
        status: "accepted",
      },
    });

    const usersRecipe = await prisma.recipe.create({
      data: {
        name: "users recipe",
        user_id: user.id,
      },
    });

    const usersRecipeShare = await prisma.recipeShare.create({
      data: {
        user_kitchen_membership_id: mirroredMembership.id,
        recipe_id: usersRecipe.id,
      },
    });

    const response = await request(server)
      .get(`/recipe/${othersRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: GetRecipeResponseSchema = response.body;

    expect(responseData.recipe_shares?.length).toBe(1);
    expect(responseData.recipe_shares![0].id).toBe(share.id);
  });
});
