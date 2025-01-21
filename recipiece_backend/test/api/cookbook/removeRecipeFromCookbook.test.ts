import { User, prisma } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { generateCookbookWithRecipe } from "./fixtures";

describe("Remove Recipe from Cookbook", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a recipe to be removed from a cookbook", async () => {
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

  it("should not allow another user to remove recipes from a users cookbook", async () => {
    const [otherCookbook, otherRecipe] = await generateCookbookWithRecipe();

    const response = await request(server)
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
