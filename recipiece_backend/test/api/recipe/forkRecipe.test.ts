import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { RecipeSchema } from "../../../src/schema";
import { prisma } from "../../../src/database";

xdescribe("Fork Recipe", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should allow a user to fork a recipe", async () => {
    const originalRecipe = await prisma.recipe.create({
      data: {
        user_id: otherUser.id,
        name: "test recipe",
        description: "here is a really cool recipe",
        duration_ms: 50000,
        servings: 24,
        metadata: {
          some: "nonsense",
        },
        ingredients: {
          createMany: {
            data: [
              {
                name: "Ing 01",
                order: 0,
              },
              {
                name: "Ing 02",
                amount: "75 1/3",
                unit: "cups of coffee",
                order: 1,
              },
            ],
          },
        },
        steps: {
          createMany: {
            data: [
              {
                content: "asdfqwer1",
                order: 0,
              },
              {
                content: "zxcvqwer2",
                order: 1,
              },
            ],
          },
        },
      },
      include: {
        steps: true,
        ingredients: true,
      },
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: originalRecipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    const createdRecipe = response.body as RecipeSchema;

    expect(createdRecipe.id).not.toBe(originalRecipe.id);
    expect(createdRecipe.description).toEqual(originalRecipe.description);
    expect(createdRecipe.duration_ms).toEqual(originalRecipe.duration_ms);
    expect(createdRecipe.servings).toEqual(originalRecipe.servings);

    expect(createdRecipe.ingredients?.length).toBe(2);
    const createdOrderedIngredients = createdRecipe.ingredients!.sort((a, b) => a.order - b.order);
    const originalOrderedIngredients = originalRecipe.ingredients.sort((a, b) => a.order - b.order);
    expect(createdOrderedIngredients[0].name).toEqual(originalOrderedIngredients[0].name);

    expect(createdOrderedIngredients[1].name).toEqual(originalOrderedIngredients[1].name);
    expect(createdOrderedIngredients[1].amount).toEqual(originalOrderedIngredients[1].amount);
    expect(createdOrderedIngredients[1].unit).toEqual(originalOrderedIngredients[1].unit);

    expect(createdRecipe.steps?.length).toBe(2);
  });

  it("should not allow you to fork another users unshared recipe", async () => {
    const originalRecipe = await prisma.recipe.create({
      data: {
        user_id: otherUser.id,
        name: "test recipe",
      },
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: originalRecipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should allow you to fork a recipe that has been shared with you", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        user_id: otherUser.id,
        name: "test recipe",
      },
    });

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "accepted",
      },
    });

    const share = await prisma.recipeShare.create({
      data: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const forkedRecipe = await prisma.recipe.findFirst({
      where: {
        name: recipe.name,
        user_id: user.id,
      },
    });

    expect(forkedRecipe).toBeTruthy();
  });

  it("should not allow you to fork a recipe that does not exist", async () => {
    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: 100000000,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow a user to fork their own recipe", async () => {
    const originalRecipe = await prisma.recipe.create({
      data: {
        user_id: user.id,
        name: "test recipe",
        description: "here is a really cool recipe",
        duration_ms: 50000,
        servings: 24,
        metadata: {
          some: "nonsense",
        },
        ingredients: {
          createMany: {
            data: [
              {
                name: "Ing 01",
                order: 0,
              },
              {
                name: "Ing 02",
                amount: "75 1/3",
                unit: "cups of coffee",
                order: 1,
              },
            ],
          },
        },
        steps: {
          createMany: {
            data: [
              {
                content: "asdfqwer1",
                order: 0,
              },
              {
                content: "zxcvqwer2",
                order: 1,
              },
            ],
          },
        },
      },
      include: {
        steps: true,
        ingredients: true,
      },
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: originalRecipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });
});
