import { Constant } from "@recipiece/constant";
import { Prisma, Recipe, User, UserKitchenMembershipGrantLevel } from "@recipiece/database";
import {
  generateCookbook,
  generateRecipe,
  generateRecipeCookbookAttachment,
  generateRecipeShare,
  generateRecipeTagAttachment,
  generateRecipeWithIngredientsAndSteps,
  generateUser,
  generateUserKitchenMembership,
  generateUserTag,
} from "@recipiece/test";
import { ListRecipesQuerySchema, ListRecipesResponseSchema, RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list recipes for a user", async () => {
    const recipes = [];
    for (let i = 0; i < 10; i++) {
      recipes.push(await generateRecipe({ user_id: user.id }));
    }

    // make some noise!
    await generateRecipe();
    await generateRecipe();
    await generateRecipe();

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

    const expectedIds = recipes.map((r) => r.id);
    results.forEach((bodyRecipe) => {
      expect(bodyRecipe.user_id).toBe(user.id);
      expect(expectedIds.includes(bodyRecipe.id)).toBeTruthy();
    });
  });

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: user.id });
    }
    const filterRecipe = await generateRecipe({ user_id: user.id, name: "NAME NAME NAME!!!" });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        search: "!!!",
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual(filterRecipe.name);
  });

  it("should allow ingredient filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: user.id });
    }

    const expectedRecipe = await generateRecipeWithIngredientsAndSteps({
      user_id: user.id,
      ingredients: [
        {
          name: "test ingredient",
        },
      ],
    });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        ingredients:
          `${expectedRecipe.ingredients[0].name.toUpperCase()},asdf` as unknown as ListRecipesQuerySchema["ingredients"],
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(1);
    expect(results[0].id).toEqual(expectedRecipe.id);
  });

  it("should allow tag filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: user.id });
    }

    const expectedRecipe = await generateRecipe({ user_id: user.id });
    const tag = await generateUserTag({
      user_id: user.id,
      content: "test tag",
    });
    await generateRecipeTagAttachment({
      user_tag_id: tag.id,
      recipe_id: expectedRecipe.id,
    });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        tags: `${tag.content.toUpperCase()},nonsense` as unknown as ListRecipesQuerySchema["tags"],
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(1);
    expect(results[0].id).toEqual(expectedRecipe.id);
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: user.id });
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

  it("should list shared recipes belonging to a SELECTIVE grant type membership", async () => {
    const otherUser = await generateUser();
    // allow otherUser to share a recipe to user
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "SELECTIVE",
    });

    const otherRecipe = await generateRecipe({ user_id: otherUser.id });

    await generateRecipeShare({
      user_kitchen_membership_id: membership.id,
      recipe_id: otherRecipe.id,
    });

    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: user.id });
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

  it("should list shared recipes belonging to an ALL grant type membership", async () => {
    const otherUser = await generateUser();
    // allow otherUser to share a recipe to user
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "ALL",
    });

    // generate some recipes for the other user
    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: otherUser.id });
    }

    // generate some recipes for the destination user user
    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: user.id });
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

    expect(responseRecipes.length).toBe(20);

    const belongingToUser = responseRecipes.filter((recipe) => recipe.user_id === user.id);
    expect(belongingToUser.length).toBe(10);

    const belongingToOther = responseRecipes.filter((recipe) => recipe.user_id === otherUser.id);
    expect(belongingToOther.length).toBe(10);
  });

  it("should not list shared recipes belonging to a non-accepted membership", async () => {
    const otherUser = await generateUser();
    // allow otherUser to share a recipe to user
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "denied",
    });

    const otherRecipe = await generateRecipe({ user_id: otherUser.id });

    await generateRecipeShare({
      user_kitchen_membership_id: membership.id,
      recipe_id: otherRecipe.id,
    });

    for (let i = 0; i < 10; i++) {
      await generateRecipe({
        user_id: user.id,
      });
    }

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 0,
        shared_recipes: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseRecipes: RecipeSchema[] = response.body.data;

    expect(responseRecipes.length).toBe(10);
    responseRecipes.forEach((rcp) => {
      expect(rcp.id).not.toBe(otherRecipe.id);
    });
  });

  it("should list recipes in a cookbook", async () => {
    for (let i = 0; i < 10; i++) {
      await generateRecipe({ user_id: user.id });
    }

    const recipeToAttach = await generateRecipe({ user_id: user.id });
    const cookbook = await generateCookbook({ user_id: user.id });

    const attachment = await generateRecipeCookbookAttachment({
      recipe_id: recipeToAttach.id,
      cookbook_id: cookbook.id,
    });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 0,
        cookbook_id: cookbook.id,
        cookbook_attachments_filter: "include",
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
      await generateRecipe({ user_id: user.id });
    }

    const recipeToAttach = await generateRecipe({ user_id: user.id });
    const cookbook = await generateCookbook({ user_id: user.id });
    const attachment = await generateRecipeCookbookAttachment({
      recipe_id: recipeToAttach.id,
      cookbook_id: cookbook.id,
    });

    const otherCookbook = await generateCookbook({ user_id: user.id });
    await generateRecipeCookbookAttachment({
      recipe_id: recipeToAttach.id,
      cookbook_id: otherCookbook.id,
    });

    const response = await request(server)
      .get("/recipe/list")
      .query(<ListRecipesQuerySchema>{
        page_number: 0,
        cookbook_id: cookbook.id,
        cookbook_attachments_filter: "exclude",
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

  describe("user_kitchen_membership_ids Filter", () => {
    it("should list only user owned recipes", async () => {
      const recipes = [];
      for (let i = 0; i < 10; i++) {
        recipes.push(await generateRecipe({ user_id: user.id }));
      }

      const allGrantUser = await generateUser();
      await generateUserKitchenMembership({
        source_user_id: allGrantUser.id,
        destination_user_id: user.id,
        status: "accepted",
        grant_level: "ALL",
      });
      await generateRecipe({ user_id: allGrantUser.id });

      const selectiveGrantUser = await generateUser();
      const selectiveMembership = await generateUserKitchenMembership({
        source_user_id: selectiveGrantUser.id,
        destination_user_id: user.id,
        status: "accepted",
        grant_level: "SELECTIVE",
      });
      const selectiveRecipe = await generateRecipe({ user_id: selectiveGrantUser.id });
      await generateRecipeShare({
        recipe_id: selectiveRecipe.id,
        user_kitchen_membership_id: selectiveMembership.id,
      });

      const response = await request(server)
        .get("/recipe/list")
        .query({
          page_number: 0,
          user_kitchen_membership_ids: [Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER].join(","),
        })
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      const responseData: ListRecipesResponseSchema = response.body;

      expect(responseData.data.length).toBe(10);
      const expectedRecipeIds = recipes.map((r) => r.id);
      responseData.data.forEach((datum) => {
        expect(expectedRecipeIds.includes(datum.id)).toBeTruthy();
      });
    });

    it("should list all recipes", async () => {
      const recipes = [];
      for (let i = 0; i < 10; i++) {
        recipes.push(await generateRecipe({ user_id: user.id }));
      }

      const allGrantUser = await generateUser();
      await generateUserKitchenMembership({
        source_user_id: allGrantUser.id,
        destination_user_id: user.id,
        status: "accepted",
        grant_level: "ALL",
      });
      const allRecipe = await generateRecipe({ user_id: allGrantUser.id });

      const selectiveGrantUser = await generateUser();
      const selectiveMembership = await generateUserKitchenMembership({
        source_user_id: selectiveGrantUser.id,
        destination_user_id: user.id,
        status: "accepted",
        grant_level: "SELECTIVE",
      });
      const selectiveRecipe = await generateRecipe({ user_id: selectiveGrantUser.id });
      await generateRecipeShare({
        recipe_id: selectiveRecipe.id,
        user_kitchen_membership_id: selectiveMembership.id,
      });

      const response = await request(server)
        .get("/recipe/list")
        .query({
          page_number: 0,
          user_kitchen_membership_ids: [Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL].join(","),
        })
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      const responseData: ListRecipesResponseSchema = response.body;

      expect(responseData.data.length).toBe(12);
      const expectedRecipeIds = [...recipes.map((r) => r.id), selectiveRecipe.id, allRecipe.id];
      responseData.data.forEach((datum) => {
        expect(expectedRecipeIds.includes(datum.id)).toBeTruthy();
      });
    });

    it.each(<UserKitchenMembershipGrantLevel[]>["SELECTIVE", "ALL"])(
      "should list only recipes belonging to a particular membership",
      async (grantLevel) => {
        const recipes = [];
        for (let i = 0; i < 10; i++) {
          recipes.push(await generateRecipe({ user_id: user.id }));
        }

        const otherUser = await generateUser();
        const membership = await generateUserKitchenMembership({
          source_user_id: otherUser.id,
          destination_user_id: user.id,
          status: "accepted",
          grant_level: grantLevel,
        });
        const otherRecipe = await generateRecipe({ user_id: otherUser.id });
        if (grantLevel === "SELECTIVE") {
          await generateRecipeShare({
            recipe_id: otherRecipe.id,
            user_kitchen_membership_id: membership.id,
          });
        }

        const response = await request(server)
          .get("/recipe/list")
          .query({
            page_number: 0,
            user_kitchen_membership_ids: [membership.id.toString()].join(","),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${bearerToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
        const responseData: ListRecipesResponseSchema = response.body;

        expect(responseData.data.length).toBe(1);
        expect(responseData.data[0].id).toBe(otherRecipe.id);
      }
    );

    it.each(<UserKitchenMembershipGrantLevel[]>["SELECTIVE", "ALL"])(
      "should list recipes belonging to the user and to selected memberships",
      async (grantLevel) => {
        const recipes = [];
        for (let i = 0; i < 10; i++) {
          recipes.push(await generateRecipe({ user_id: user.id }));
        }

        const otherUser = await generateUser();
        const membership = await generateUserKitchenMembership({
          source_user_id: otherUser.id,
          destination_user_id: user.id,
          status: "accepted",
          grant_level: grantLevel,
        });
        const otherRecipe = await generateRecipe({ user_id: otherUser.id });
        if (grantLevel === "SELECTIVE") {
          await generateRecipeShare({
            recipe_id: otherRecipe.id,
            user_kitchen_membership_id: membership.id,
          });
        }

        const thirdMembership = await generateUserKitchenMembership({
          destination_user_id: user.id,
          status: "accepted",
          grant_level: "ALL",
        });
        await generateRecipe({ user_id: thirdMembership.source_user_id });

        const response = await request(server)
          .get("/recipe/list")
          .query({
            page_number: 0,
            user_kitchen_membership_ids: [membership.id.toString(), Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER].join(
              ","
            ),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${bearerToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
        const responseData: ListRecipesResponseSchema = response.body;

        expect(responseData.data.length).toBe(11);
        const expectedIds = [...recipes.map((r) => r.id), otherRecipe.id];
        responseData.data.forEach((datum) => {
          expect(expectedIds.includes(datum.id)).toBeTruthy();
        });
      }
    );
  });
});
