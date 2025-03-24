import { User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateCookbook, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { CookbookSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Get Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to get their own cookbook", async () => {
    const cookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server).get(`/cookbook/${cookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body.id).toEqual(cookbook.id);
  });

  it("should not get a cookbook that you do not own and is not shared to you", async () => {
    const otherCookbook = await generateCookbook();

    const response = await request(server).get(`/cookbook/${otherCookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a cookbook that does not exist", async () => {
    const response = await request(server).get("/cookbook/900000000").set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it.each([true, false])("should get a shared cookbook when user is source user is %o", async (isUserSourceUser) => {
    const otherUser = await generateUser();
    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });
    const cookbook = await generateCookbook({ user_id: otherUser.id });

    const response = await request(server).get(`/cookbook/${cookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody: CookbookSchema = response.body;

    expect(responseBody.id).toBe(cookbook.id);
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not get a cookbook when the associated membership has status %o", async (membershipStatus) => {
    const otherUser = await generateUser();
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: membershipStatus,
    });
    const cookbook = await generateCookbook({ user_id: otherUser.id });

    const response = await request(server).get(`/cookbook/${cookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
