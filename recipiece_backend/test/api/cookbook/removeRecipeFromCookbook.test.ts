import { User } from "@prisma/client";
// @ts-ignore
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import app from "../../../src/app";
import { createUserAndToken } from "../../fixture";
import { prisma } from "../../../src/database";

describe("Remove Recipe from Cookbook", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a recipe to be removed from a cookbook", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      },
    });

    const cookbook = await prisma.cookbook.create({
      data: {
        name: "test cookbook",
        user_id: user.id,
      },
    });

    await prisma.recipeCookbookAttachment.create({
      data: {
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      },
    });

    const response = await request(app)
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

  it("should not allow another user to remove recipes from a users cookbook", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    const otherCookbook = await prisma.cookbook.create({
      data: {
        user_id: otherUser.id,
        name: "other user cookbook",
      },
    });

    const otherRecipe = await prisma.recipe.create({
      data: {
        user_id: otherUser.id,
        name: "other user cookbook",
      },
    });

    await prisma.recipeCookbookAttachment.create({
      data: {
        recipe_id: otherRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    const response = await request(app)
      .post("/cookbook/recipe/remove")
      .send({
        recipe_id: otherRecipe.id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: otherRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(1);
  });
});
