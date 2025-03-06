import { prisma, User } from "@recipiece/database";
import {
  generateCookbook,
  generateRecipe,
  generateRecipeCookbookAttachment,
  generateUser,
  generateUserKitchenMembership,
} from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { generateCookbookWithRecipe } from "./fixtures";

describe("Remove Recipe from Cookbook", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow the cookbook owner to remove a recipe", async () => {
    const [cookbook, recipe] = await generateCookbookWithRecipe(user.id);

    const response = await request(server)
      .post("/cookbook/recipe/remove")
      .send({
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      },
    });

    expect(attachments.length).toEqual(0);
  });

  it("should allow a shared user to remove a recipe", async () => {
    const otherUser = await generateUser();
    const otherCookbook = await generateCookbook({ user_id: otherUser.id });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "ALL",
    });

    const userRecipe = await generateRecipe({ user_id: user.id });
    const attachment = await generateRecipeCookbookAttachment({
      recipe_id: userRecipe.id,
      cookbook_id: otherCookbook.id,
    });

    const response = await request(server)
      .post("/cookbook/recipe/remove")
      .send({
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: userRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(0);
  });

  it("should not allow a non-shared user to remove a recipe", async () => {
    const otherUser = await generateUser();
    const otherCookbook = await generateCookbook({ user_id: otherUser.id });
    const attachment = await generateRecipeCookbookAttachment({ cookbook_id: otherCookbook.id });

    const response = await request(server)
      .post("/cookbook/recipe/remove")
      .send({
        recipe_id: attachment.recipe_id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: attachment.recipe_id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(1);
  });

  it("should not allow a denied membership to remove a recipe", async () => {
    const otherUser = await generateUser();
    const otherCookbook = await generateCookbook({ user_id: otherUser.id });
    const attachment = await generateRecipeCookbookAttachment({
      cookbook_id: otherCookbook.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "denied",
      grant_level: "ALL",
    });

    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: attachment.recipe_id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: attachment.recipe_id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(1);
  });

  it("should not allow a non-shared user to remove a recipe", async () => {
    const otherUser = await generateUser();
    const otherCookbook = await generateCookbook({ user_id: otherUser.id });
    const attachment = await generateRecipeCookbookAttachment({
      cookbook_id: otherCookbook.id,
    });

    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: attachment.recipe_id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: attachment.recipe_id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(1);
  });
});
