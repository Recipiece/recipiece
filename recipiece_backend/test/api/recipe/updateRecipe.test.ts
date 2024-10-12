import { User } from "@prisma/client";
// @ts-ignore
import { createUserAndToken } from "../../fixture";
import request from "supertest";
import app from "../../../src/app";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../src/database";
import { RecipeSchema } from "../../../src/schema";

describe("Update Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should update a recipe", async () => {
    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "My Cool Recipe",
        description: "A recipe",
        user_id: user.id,
        ingredients: {
          createMany: {
            data: [
              {
                name: "old ingredient 01",
                order: 0,
              },
              {
                name: "old ingredient 02",
                order: 1,
              },
            ],
          },
        },
        steps: {
          createMany: {
            data: [
              {
                content: "asdfqwer",
                order: 0,
              },
            ],
          },
        },
      },
    });

    const response = await request(app)
      .put("/recipe")
      .send({
        id: existingRecipe.id,
        name: existingRecipe.name + "asdfqwer",
        description: existingRecipe.description + "zxcvuiop",
        ingredients: [
          {
            name: "new ingredient",
            unit: "new unit",
            amount: "1",
            order: 0,
          },
        ],
        steps: [
          {
            content: "yeet",
            order: 0,
          },
        ],
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody = response.body as RecipeSchema;

    expect(responseBody.name).toEqual(existingRecipe.name + "asdfqwer");
    expect(responseBody.description).toEqual(existingRecipe.description + "zxcvuiop");

    expect(responseBody.ingredients).toBeTruthy();
    expect(responseBody.ingredients?.length).toEqual(1);
    const ing = responseBody.ingredients![0];
    expect(ing.recipe_id).toEqual(existingRecipe.id);
    expect(ing.name).toEqual("new ingredient");
    expect(ing.unit).toEqual("new unit");
    expect(ing.amount).toEqual("1");
    expect(ing.order).toEqual(0);

    expect(responseBody.steps).toBeTruthy();
    expect(responseBody.steps!.length).toEqual(1);
    const step = responseBody.steps![0];
    expect(step.recipe_id).toEqual(existingRecipe.id);
    expect(step.content).toEqual("yeet");
    expect(step.order).toEqual(0);

    const allIngredients = await prisma.recipeIngredient.findMany({
      where: {
        recipe_id: existingRecipe.id,
      },
    });
    expect(allIngredients.length).toEqual(1);
    expect(allIngredients[0].id).toEqual(ing.id);

    const allSteps = await prisma.recipeStep.findMany({
      where: {
        recipe_id: existingRecipe.id,
      },
    });
    expect(allSteps.length).toEqual(1);
    expect(allSteps[0].id).toEqual(step.id);
  });

  it(`should ${StatusCodes.NOT_FOUND} when a recipe is not found`, async () => {
    const response = await request(app)
      .put("/recipe")
      .send({
        id: 1,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it(`should ${StatusCodes.NOT_FOUND} when trying to update a recipe you don't own`, async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");

    const existingRecipe = await prisma.recipe.create({
      data: {
        name: "My Cool Recipe",
        description: "A recipe",
        user_id: otherUser.id,
        ingredients: {
          createMany: {
            data: [
              {
                name: "old ingredient 01",
                order: 0,
              },
              {
                name: "old ingredient 02",
                order: 1,
              },
            ],
          },
        },
        steps: {
          createMany: {
            data: [
              {
                content: "asdfqwer",
                order: 0,
              },
            ],
          },
        },
      },
    });

    const response = await request(app)
      .put("/recipe")
      .send({
        id: existingRecipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
