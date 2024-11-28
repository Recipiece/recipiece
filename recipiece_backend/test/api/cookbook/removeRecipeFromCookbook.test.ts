import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Remove Recipe from Cookbook", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a recipe to be removed from a cookbook", async () => {
    const recipe = await testPrisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      },
    });

    const cookbook = await testPrisma.cookbook.create({
      data: {
        name: "test cookbook",
        user_id: user.id,
      },
    });

    await testPrisma.recipeCookbookAttachment.create({
      data: {
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      },
    });

    const response = await request(server)
      .post("/cookbook/recipe/remove")
      .send({
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const attachments = await testPrisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      },
    });

    expect(attachments.length).toEqual(0);
  });

  it("should not allow another user to remove recipes from a users cookbook", async () => {
    const [otherUser] = await fixtures.createUserAndToken("otheruser@recipiece.org");
    const otherCookbook = await testPrisma.cookbook.create({
      data: {
        user_id: otherUser.id,
        name: "other user cookbook",
      },
    });

    const otherRecipe = await testPrisma.recipe.create({
      data: {
        user_id: otherUser.id,
        name: "other user cookbook",
      },
    });

    await testPrisma.recipeCookbookAttachment.create({
      data: {
        recipe_id: otherRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    const response = await request(server)
      .post("/cookbook/recipe/remove")
      .send({
        recipe_id: otherRecipe.id,
        cookbook_id: otherCookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const attachments = await testPrisma.recipeCookbookAttachment.findMany({
      where: {
        recipe_id: otherRecipe.id,
        cookbook_id: otherCookbook.id,
      },
    });

    expect(attachments.length).toEqual(1);
  });
});
