import { Cookbook, User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateCookbook, generateRecipe, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { ListCookbooksQuerySchema, ListCookbooksResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { generateCookbookWithRecipe } from "./fixtures";

describe("List Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list the cookbooks for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await generateCookbook({ user_id: user.id });
    }

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Cookbook[];
    expect(results.length).toEqual(10);
  });

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await generateCookbook({ user_id: user.id });
    }
    const filterCookbook = await generateCookbook({ user_id: user.id, name: "NAME NAME NAME" });

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        search: "name",
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Cookbook[];
    expect(results.length).toEqual(1);
    expect(results[0].id).toEqual(filterCookbook.id);
    expect(results[0].name).toEqual(filterCookbook.name);
  });

  it("should page", async () => {
    const [user, bearerToken] = await fixtures.createUserAndToken();
    for (let i = 0; i < 10; i++) {
      await generateCookbook({ user_id: user.id });
    }

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        page_number: 1,
        page_size: 5,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Cookbook[];
    expect(results.length).toEqual(5);
  });

  it("should exclude cookbooks containing a certain recipe", async () => {
    const notContainingCookbook = await generateCookbook({ user_id: user.id });
    const [_, recipe] = await generateCookbookWithRecipe(user.id);

    const response = await request(server)
      .get("/cookbook/list")
      .query(<ListCookbooksQuerySchema>{
        page_number: 0,
        recipe_id: recipe.id,
        recipe_id_filter: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    const data: Cookbook[] = response.body.data;

    expect(data.length).toBe(1);
    expect(data[0].id).toBe(notContainingCookbook.id);
  });

  it("should include cookbooks containing a certain recipe", async () => {
    await generateCookbook({ user_id: user.id });
    const [containingCookbook, recipe] = await generateCookbookWithRecipe(user.id);

    const response = await request(server)
      .get("/cookbook/list")
      .query(<ListCookbooksQuerySchema>{
        page_number: 0,
        recipe_id: recipe.id,
        recipe_id_filter: "include",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    const data: Cookbook[] = response.body.data;

    expect(data.length).toBe(1);
    expect(data[0].id).toBe(containingCookbook.id);
  });

  it.each([true, false])("should include shared cookbooks when user is source user is %o", async (isUserSourceUser) => {
    const otherUser = await generateUser();
    await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });
    const otherUserCookbook = await generateCookbook({ user_id: otherUser.id });
    const userCookbook = await generateCookbook({ user_id: user.id });

    // make some noise!
    await generateCookbook();

    const response = await request(server)
      .get("/cookbook/list")
      .query(<ListCookbooksQuerySchema>{
        page_number: 0,
        shared_cookbooks_filter: "include",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListCookbooksResponseSchema = response.body;

    expect(responseData.data.length).toBe(2);
    expect(responseData.data.find((c) => c.id === otherUserCookbook.id)).toBeTruthy();
    expect(responseData.data.find((c) => c.id === userCookbook.id)).toBeTruthy();
  });

  it("should exclude shared cookbooks", async () => {
    const otherUserAll = await generateUser();
    await generateUserKitchenMembership({
      source_user_id: otherUserAll.id,
      destination_user_id: user.id,
      status: "accepted",
    });
    await generateCookbook({ user_id: otherUserAll.id });

    const userCookbook = await generateCookbook({ user_id: user.id });

    await generateCookbook();

    const response = await request(server)
      .get("/cookbook/list")
      .query(<ListCookbooksQuerySchema>{
        page_number: 0,
        shared_cookbooks_filter: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListCookbooksResponseSchema = response.body;

    expect(responseData.data.length).toBe(1);
    expect(responseData.data.find((c) => c.id === userCookbook.id)).toBeTruthy();
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not list cookbooks belonging membership with status %o", async (membershipStatus) => {
    const otherUserAll = await generateUser();
    await generateUserKitchenMembership({
      source_user_id: otherUserAll.id,
      destination_user_id: user.id,
      status: membershipStatus,
    });
    await generateCookbook({ user_id: otherUserAll.id });

    const userCookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server)
      .get("/cookbook/list")
      .query(<ListCookbooksQuerySchema>{
        page_number: 0,
        shared_cookbooks_filter: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListCookbooksResponseSchema = response.body;

    expect(responseData.data.length).toBe(1);
    expect(responseData.data.find((c) => c.id === userCookbook.id)).toBeTruthy();
  });

  it("should not list cookbooks for a recipe where the cookbook owner does not have access to the recipe", async () => {
    const membership = await generateUserKitchenMembership({
      destination_user_id: user.id,
      status: "accepted",
    });
    const recipe = await generateRecipe({user_id: user.id});
    const userCookbook = await generateCookbook({ user_id: user.id });
    const sharedCookbook = await generateCookbook({ user_id: membership.source_user_id });

    const response = await request(server)
      .get("/cookbook/list")
      .query(<ListCookbooksQuerySchema>{
        page_number: 0,
        recipe_id: recipe.id,
        recipe_id_filter: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListCookbooksResponseSchema = response.body;

    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].id).toBe(userCookbook.id);
  });
});
