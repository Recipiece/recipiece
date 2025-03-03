import { Cookbook, User } from "@recipiece/database";
import { generateCookbook, generateCookbookShare, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { generateCookbookWithRecipe } from "./fixtures";
import { ListCookbooksQuerySchema, ListCookbooksResponseSchema } from "@recipiece/types";

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

  it("should include shared cookbooks", async () => {
    // create a SELECTIVE membership
    const otherUserSelective = await generateUser();
    const selectiveMembership = await generateUserKitchenMembership({
      source_user_id: otherUserSelective.id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "SELECTIVE",
    });
    const selectiveSharedCookbook = await generateCookbook({ user_id: otherUserSelective.id });
    await generateCookbookShare({
      user_kitchen_membership_id: selectiveMembership.id,
      cookbook_id: selectiveSharedCookbook.id,
    });

    // create an ALL membership
    const otherUserAll = await generateUser();
    const allMembership = await generateUserKitchenMembership({
      source_user_id: otherUserAll.id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "ALL",
    });
    const allCookbook = await generateCookbook({ user_id: otherUserAll.id });

    // create a cookbook for the user
    const userCookbook = await generateCookbook({ user_id: user.id });

    // make some noise
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

    expect(responseData.data.length).toBe(3);
    expect(responseData.data.find((c) => c.id === selectiveSharedCookbook.id)).toBeTruthy();
    expect(responseData.data.find((c) => c.id === allCookbook.id)).toBeTruthy();
    expect(responseData.data.find((c) => c.id === userCookbook.id)).toBeTruthy();
  });

  it("should exclude shared cookbooks", async () => {
    const otherUserSelective = await generateUser();
    const selectiveMembership = await generateUserKitchenMembership({
      source_user_id: otherUserSelective.id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "SELECTIVE",
    });
    const selectiveSharedCookbook = await generateCookbook({ user_id: otherUserSelective.id });
    await generateCookbookShare({
      user_kitchen_membership_id: selectiveMembership.id,
      cookbook_id: selectiveSharedCookbook.id,
    });

    const otherUserAll = await generateUser();
    await generateUserKitchenMembership({
      source_user_id: otherUserAll.id,
      destination_user_id: user.id,
      status: "accepted",
      grant_level: "ALL",
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

  it("should not list cookbooks belonging to a non-accepted membership", async () => {
    const otherUserSelective = await generateUser();
    const selectiveMembership = await generateUserKitchenMembership({
      source_user_id: otherUserSelective.id,
      destination_user_id: user.id,
      status: "denied",
      grant_level: "SELECTIVE",
    });
    const selectiveSharedCookbook = await generateCookbook({ user_id: otherUserSelective.id });
    await generateCookbookShare({
      user_kitchen_membership_id: selectiveMembership.id,
      cookbook_id: selectiveSharedCookbook.id,
    });

    const otherUserAll = await generateUser();
    await generateUserKitchenMembership({
      source_user_id: otherUserAll.id,
      destination_user_id: user.id,
      status: "denied",
      grant_level: "ALL",
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
});
