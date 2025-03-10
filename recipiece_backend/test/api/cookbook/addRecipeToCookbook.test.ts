import { prisma, User } from "@recipiece/database";
import { generateCookbook, generateRecipe, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { generateCookbookWithRecipe } from "./fixtures";

describe("Add Recipe to Cookbook", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a recipe to be attached to a cookbook", async () => {
    const recipe = await generateRecipe({ user_id: user.id });
    const cookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CREATED);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      },
    });

    expect(attachments.length).toEqual(1);
  });

  it("should allow a shared user to attach a recipe", async () => {
    const otherUser = await generateUser();
    const otherCookbook = await generateCookbook({ user_id: otherUser.id });
    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const userRecipe = await generateRecipe({ user_id: user.id });
    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CREATED);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(1);
  });

  it("should not allow a non-shared user to attach a recipe", async () => {
    const otherUser = await generateUser();
    const otherCookbook = await generateCookbook({ user_id: otherUser.id });

    const userRecipe = await generateRecipe({ user_id: user.id });
    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(0);
  });

  it("should not allow a denied membership to attach a recipe", async () => {
    const otherUser = await generateUser();
    const otherCookbook = await generateCookbook({ user_id: otherUser.id });
    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "denied",
    });

    const userRecipe = await generateRecipe({ user_id: user.id });
    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(0);
  });

  it("should not allow duplicate attachments in the same cookbook", async () => {
    const [cookbook, recipe] = await generateCookbookWithRecipe(user.id);

    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
  });
});
