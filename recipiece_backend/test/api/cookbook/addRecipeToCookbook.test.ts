import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";

describe("Add Recipe to Cookbook", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a recipe to be attached to a cookbook", async () => {
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

  it("should not allow another users recipe to be attached to a cookbook", async () => {
    const [otherUser] = await fixtures.createUserAndToken({email: "otheruser@recipiece.org"});
    const otherRecipe = await prisma.recipe.create({
      data: {
        name: "other users recipe",
        user_id: otherUser.id,
      },
    });

    const cookbook = await prisma.cookbook.create({
      data: {
        name: "test cookbook",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .post("/cookbook/recipe/add")
      .send({
        recipe_id: otherRecipe.id,
        cookbook_id: cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await prisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: otherRecipe.id,
        cookbook_id: cookbook.id,
      },
    });

    expect(attachments.length).toEqual(0);
  });

  it("should not allow duplicate attachments in the same cookbook", async () => {
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
