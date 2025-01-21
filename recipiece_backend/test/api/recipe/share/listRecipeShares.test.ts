import { User } from "@recipiece/database";
import { generateRecipe, generateRecipeShare, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { ListRecipeSharesQuerySchema, ListRecipeSharesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Recipe Shares", () => {
  let user: User;
  let userBearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, userBearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it("should list recipe shares targeting the user", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const recipe = await generateRecipe({ user_id: user.id });
    const share = await generateRecipeShare({
      user_kitchen_membership_id: membership.id,
      recipe_id: recipe.id,
    });

    const response = await request(server)
      .get(`/recipe/share/list`)
      .query(<ListRecipeSharesQuerySchema>{
        page_number: 0,
        targeting_self: true,
      })
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListRecipeSharesResponseSchema = response.body;
    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].id).toBe(share.id);
  });

  it("should list recipe shares originating from the user", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const recipe = await generateRecipe({ user_id: user.id });
    const share = await generateRecipeShare({
      user_kitchen_membership_id: membership.id,
      recipe_id: recipe.id,
    });

    const response = await request(server)
      .get(`/recipe/share/list`)
      .query(<ListRecipeSharesQuerySchema>{
        page_number: 0,
        from_self: true,
      })
      .set("Authorization", `Bearer ${userBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListRecipeSharesResponseSchema = response.body;
    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].id).toBe(share.id);
  });

  it("should list shares for a particular user kitchen membership", async () => {
    const thirdUser = await generateUser();
    const userToOtherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });

    const userToThirdMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: thirdUser.id,
      status: "accepted",
    });

    const recipe = await generateRecipe({ user_id: user.id });

    const userToOtherShare = await generateRecipeShare({
      recipe_id: recipe.id,
      user_kitchen_membership_id: userToOtherMembership.id,
    });

    const userToThirdShare = await generateRecipeShare({
      recipe_id: recipe.id,
      user_kitchen_membership_id: userToThirdMembership.id,
    });

    const response = await request(server)
      .get(`/recipe/share/list`)
      .query(<ListRecipeSharesQuerySchema>{
        page_number: 0,
        from_self: true,
        user_kitchen_membership_id: userToOtherMembership.id,
      })
      .set("Authorization", `Bearer ${userBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListRecipeSharesResponseSchema = response.body;
    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].id).toBe(userToOtherShare.id);
  });

  it("should only list shares for accepted memberships", async () => {
    const userToOtherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "denied",
    });

    const recipe = await generateRecipe({ user_id: user.id });

    const userToOtherShare = await generateRecipeShare({
      recipe_id: recipe.id,
      user_kitchen_membership_id: userToOtherMembership.id,
    });

    const response = await request(server)
      .get(`/recipe/share/list`)
      .query(<ListRecipeSharesQuerySchema>{
        page_number: 0,
        from_self: true,
      })
      .set("Authorization", `Bearer ${userBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListRecipeSharesResponseSchema = response.body;
    expect(responseData.data.length).toBe(0);
  });
});
