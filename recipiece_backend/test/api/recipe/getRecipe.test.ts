import { prisma, User } from "@recipiece/database";
import { generateRecipe, generateRecipeShare, generateUserKitchenMembership } from "@recipiece/test";
import { RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Get Recipe", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to get a recipe", async () => {
    const existingRecipe = await generateRecipe({ user_id: user.id });

    const response = await request(server)
      .get(`/recipe/${existingRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const recipeBody = response.body as RecipeSchema;
    expect(recipeBody.id).toEqual(existingRecipe.id);
  });

  it("should not retrieve a recipe that is not shared and does not belong to the requesting user", async () => {
    const otherRecipe = await generateRecipe();

    const response = await request(server)
      .get(`/recipe/${otherRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a recipe that does not exist", async () => {
    const response = await request(server).get(`/recipe/5000`).set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should get a recipe shared with a SELECTIVE grant level", async () => {
    const otherRecipe = await generateRecipe();

    const membership = await generateUserKitchenMembership({
      source_user_id: otherRecipe.user_id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "SELECTIVE",
    });

    const share = await generateRecipeShare({
      recipe_id: otherRecipe.id,
      user_kitchen_membership_id: membership.id,
    });

    // make a membership and share going the other way to ensure we don't pick up stray records
    const mirroredMembership = await generateUserKitchenMembership({
      destination_user_id: otherRecipe.user_id,
      source_user_id: user.id,
      status: "accepted",
      grant_level: "SELECTIVE",
    });
    const usersRecipe = await generateRecipe({ user_id: user.id });
    const usersRecipeShare = await generateRecipeShare({
      user_kitchen_membership_id: mirroredMembership.id,
      recipe_id: usersRecipe.id,
    });

    const response = await request(server)
      .get(`/recipe/${otherRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: RecipeSchema = response.body;

    expect(responseData.shares?.length).toBe(1);
    expect(responseData.shares![0].id).toBe(share.id);
    expect(responseData.shares![0].recipe_id).toBe(otherRecipe.id);
    expect(responseData.shares![0].user_kitchen_membership_id).toBe(membership.id);
  });

  it("should get a recipe shared with an ALL grant level", async () => {
    const otherRecipe = await generateRecipe();
    const membership = await generateUserKitchenMembership({
      source_user_id: otherRecipe.user_id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "ALL",
    });

    // make a membership and share going the other way to ensure we don't pick up stray records
    await generateUserKitchenMembership({
      destination_user_id: otherRecipe.user_id,
      source_user_id: user.id,
      status: "accepted",
      grant_level: "ALL",
    });
    await generateRecipe({ user_id: user.id });

    const response = await request(server)
      .get(`/recipe/${otherRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: RecipeSchema = response.body;

    expect(responseData.shares?.length).toBe(1);
    expect(responseData.shares![0].id).toBe(-1);
    expect(responseData.shares![0].recipe_id).toBe(otherRecipe.id);
    expect(responseData.shares![0].user_kitchen_membership_id).toBe(membership.id);
  });

  it("should not get a shared recipe where the membership is not accepted", async () => {
    const otherRecipe = await generateRecipe();

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherRecipe.user_id,
        destination_user_id: user.id,
        status: "denied",
      },
    });

    const share = await prisma.recipeShare.create({
      data: {
        recipe_id: otherRecipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .get(`/recipe/${otherRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
