import { Recipe, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";
import { ListRecipesQuerySchema, ListRecipesResponseSchema, RecipeSchema } from "../../../src/schema";

describe("List Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list the recipes for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(10);
  });

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
        },
      });
    }

    await prisma.recipe.create({
      data: {
        name: "NAME NAME NAME",
        description: "Test",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        search: "name",
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual("NAME NAME NAME");
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 1,
        page_size: 5,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(5);
  });

  it("should list shared recipes", async () => {
    const [otherUser] = await fixtures.createUserAndToken();
    // allow otherUser to share a recipe to user
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "accepted",
      },
    });

    const otherRecipe = await prisma.recipe.create({
      data: {
        name: "Other Recipe",
        user_id: otherUser.id,
      },
    });

    await prisma.recipeShare.create({
      data: {
        user_kitchen_membership_id: membership.id,
        recipe_id: otherRecipe.id,
      },
    });

    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseRecipes: RecipeSchema[] = response.body.data;

    expect(responseRecipes.length).toBe(11);
  });

  it("should list recipes in a cookbook", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
        },
      });
    }

    const recipeToAttach = await prisma.recipe.create({
      data: {
        user_id: user.id,
        name: "attach me",
      },
    });

    const cookbook = await prisma.cookbook.create({
      data: {
        user_id: user.id,
        name: "test cookbook",
      },
    });

    const attachment = await prisma.recipeCookbookAttachment.create({
      data: {
        recipe_id: recipeToAttach.id,
        cookbook_id: cookbook.id,
      },
    });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 0,
        cookbook_id: cookbook.id,
        cookbook_attachments: "include",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseRecipes = (response.body as ListRecipesResponseSchema).data;
    expect(responseRecipes.length).toBe(1);

    expect(responseRecipes[0].id).toBe(attachment.recipe_id);
  });

  it("should exclude recipes in a cookbook", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
        },
      });
    }

    const recipeToAttach = await prisma.recipe.create({
      data: {
        user_id: user.id,
        name: "attach me",
      },
    });

    const cookbook = await prisma.cookbook.create({
      data: {
        user_id: user.id,
        name: "test cookbook",
      },
    });

    const attachment = await prisma.recipeCookbookAttachment.create({
      data: {
        recipe_id: recipeToAttach.id,
        cookbook_id: cookbook.id,
      },
    });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 0,
        cookbook_id: cookbook.id,
        cookbook_attachments: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseRecipes = (response.body as ListRecipesResponseSchema).data;
    expect(responseRecipes.length).toBe(10);
    responseRecipes.forEach((rcp) => {
      expect(rcp.id).not.toBe(attachment.recipe_id);
    });
  });
});
