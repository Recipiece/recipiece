import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a recipe to be created with ingredients and steps", async () => {
    const expectedBody = {
      name: "My Test Recipe",
      description: "A cool recipe",
      steps: [{
        content: "hello world",
        order: 0,
      }],
      ingredients: [{
        name: "asdfqwer",
        unit: "1",
        order: 0,
      }],
    }

    const response = await request(server)
      .post("/recipe")
      .send(expectedBody)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody = response.body;

    expect(responseBody.id).toBeTruthy();
    expect(responseBody.name).toEqual(expectedBody.name);
    expect(responseBody.user_id).toEqual(user.id);

    const ingredients = responseBody.ingredients;
    expect(ingredients.length).toEqual(1);
    expect(ingredients[0].recipe_id).toEqual(responseBody.id);

    const steps = responseBody.steps;
    expect(steps.length).toEqual(1);
    expect(steps[0].recipe_id).toEqual(responseBody.id);
  });

  it("should not allow a recipe with a duplicate name to be created for a given user", async () => {
    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "asdfqwer",
        user_id: user.id,
      }
    });

    const response = await request(server)
      .post("/recipe")
      .send({
        name: existingRecipe.name,
        description: "zxcvuiop",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
  });
});
