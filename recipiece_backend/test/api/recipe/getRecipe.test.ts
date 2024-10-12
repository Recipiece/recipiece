import { User } from "@prisma/client";
// @ts-ignore
import { createUserAndToken } from "../../fixture";
import request from "supertest";
import app from "../../../src/app";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../src/database";
import { RecipeSchema } from "../../../src/schema";

describe("Get Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a user to get a recipe", async () => {
    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "asdfqwer",
        user_id: user.id,
      },
    });

    const response = await request(app)
      .get(`/recipe/${existingRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const recipeBody = response.body as RecipeSchema;
    expect(recipeBody.id).toEqual(existingRecipe.id);
  });

  it("should allow a user to get their private recipe", async () => {
    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "asdfqwer",
        user_id: user.id,
        private: true,
      },
    });

    const response = await request(app)
      .get(`/recipe/${existingRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const recipeBody = response.body as RecipeSchema;
    expect(recipeBody.id).toEqual(existingRecipe.id);
  });

  it(`should ${StatusCodes.NOT_FOUND} when the recipe is private and does not belong to the requesting user`, async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "asdfqwer",
        user_id: otherUser.id,
        private: true,
      },
    });

    const response = await request(app)
      .get(`/recipe/${existingRecipe.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it(`should ${StatusCodes.NOT_FOUND} when the recipe does not exist`, async () => {
    const response = await request(app).get(`/recipe/5000`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
