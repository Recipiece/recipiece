import { User, prisma } from "@recipiece/database";
import { generateRecipe, generateUserKitchenMembership } from "@recipiece/test";
import { CreateRecipeShareRequestSchema, RecipeShareSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Recipe Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should allow a user to share a recipe from one user to another", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const recipe = await generateRecipe({ user_id: user.id });

    const response = await request(server)
      .post("/recipe/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateRecipeShareRequestSchema>{
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const bodyShare = response.body as RecipeShareSchema;
    expect(bodyShare.recipe_id).toBe(recipe.id);
    expect(bodyShare.user_kitchen_membership_id).toBe(membership.id);

    const createdShare = await prisma.recipeShare.findFirst({
      where: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeTruthy();
  });

  it("should not allow a duplicate share", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const recipe = await generateRecipe({ user_id: user.id });

    await prisma.recipeShare.create({
      data: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .post("/recipe/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateRecipeShareRequestSchema>{
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });

  it("should not allow a share to a kitchen membership that is not accepted", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "pending",
    });
    const recipe = await generateRecipe({ user_id: user.id });

    const response = await request(server)
      .post("/recipe/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateRecipeShareRequestSchema>{
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.recipeShare.findFirst({
      where: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a kitchen membership that does not exist", async () => {
    const recipe = await generateRecipe({ user_id: user.id });

    const response = await request(server)
      .post("/recipe/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateRecipeShareRequestSchema>{
        recipe_id: recipe.id,
        user_kitchen_membership_id: 100000,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.recipeShare.findFirst({
      where: {
        recipe_id: recipe.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a recipe that does not exist", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "pending",
    });

    const response = await request(server)
      .post("/recipe/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateRecipeShareRequestSchema>{
        recipe_id: 1000000,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.recipeShare.findFirst({
      where: {
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a recipe that the requesting user does not own", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "pending",
    });
    const recipe = await generateRecipe();

    const response = await request(server)
      .post("/recipe/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateRecipeShareRequestSchema>{
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.recipeShare.findFirst({
      where: {
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });
});
