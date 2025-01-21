import { User, prisma } from "@recipiece/database";
import { generateRecipe } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to delete their recipe", async () => {
    const recipe = await generateRecipe({ user_id: user.id });

    const response = await request(server).delete(`/recipe/${recipe.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const deletedRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipe.id,
      },
    });
    expect(deletedRecipe).toBeFalsy();
  });

  it("should not allow a user to delete a recipe they do not own", async () => {
    const recipe = await generateRecipe();

    const response = await request(server).delete(`/recipe/${recipe.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const deletedRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipe.id,
      },
    });
    expect(deletedRecipe).toBeTruthy();
  });

  it(`should ${StatusCodes.NOT_FOUND} when the recipe does not exist`, async () => {
    const response = await request(server).delete("/recipe/5000").set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
