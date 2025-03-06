import { prisma, User } from "@recipiece/database";
import {
  generateRecipe,
  generateRecipeShare,
  generateRecipeWithIngredientsAndSteps,
  generateUserKitchenMembership,
} from "@recipiece/test";
import { RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Fork Recipe", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should clone the recipe with ingredients and steps", async () => {
    const originalRecipe = await generateRecipeWithIngredientsAndSteps({
      user_id: otherUser.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });
    const share = await generateRecipeShare({
      user_kitchen_membership_id: membership.id,
      recipe_id: originalRecipe.id,
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

    expect(createdRecipe.ingredients?.length).toBe(originalRecipe.ingredients.length);
    expect(createdRecipe.steps?.length).toBe(originalRecipe.steps.length);

    const createdOrderedIngredients = createdRecipe.ingredients!.sort((a, b) => a.order - b.order);
    const originalOrderedIngredients = originalRecipe.ingredients.sort((a, b) => a.order - b.order);
    for (let i = 0; i < createdOrderedIngredients.length; i++) {
      expect(createdOrderedIngredients[i].name).toEqual(originalOrderedIngredients[i].name);
      expect(createdOrderedIngredients[i].amount).toEqual(originalOrderedIngredients[i].amount);
      expect(createdOrderedIngredients[i].unit).toEqual(originalOrderedIngredients[i].unit);
    }

    const createdOrderedSteps = createdRecipe.steps!.sort((a, b) => a.order - b.order);
    const originalOrderedSteps = originalRecipe.steps.sort((a, b) => a.order - b.order);
    for (let i = 0; i < createdOrderedSteps.length; i++) {
      expect(createdOrderedSteps[i].content).toEqual(originalOrderedSteps[i].content);
    }
  });

  it("should not allow you to fork another users unshared recipe", async () => {
    const recipe = await generateRecipe({
      user_id: otherUser.id,
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should allow you to fork a recipe that has been shared with you", async () => {
    const recipe = await generateRecipe({
      user_id: otherUser.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });
    await generateRecipeShare({
      recipe_id: recipe.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.CREATED);

    const forkedRecipe = await prisma.recipe.findFirst({
      where: {
        name: recipe.name,
        user_id: user.id,
      },
    });

    expect(forkedRecipe).toBeTruthy();
  });

  it("should not allow you to fork a recipe from a non-accepted membership", async () => {
    const recipe = await generateRecipe({
      user_id: otherUser.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "pending",
    });
    await generateRecipeShare({
      recipe_id: recipe.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
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
    const recipe = await generateRecipe({
      user_id: user.id,
    });

    const response = await request(server)
      .post("/recipe/fork")
      .send({
        original_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
