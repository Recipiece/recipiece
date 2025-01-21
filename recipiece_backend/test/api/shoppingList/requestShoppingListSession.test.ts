import { prisma, ShoppingList, User } from "@recipiece/database";
import { generateShoppingList, generateShoppingListShare, generateUserKitchenMembership } from "@recipiece/test";
import { RequestShoppingListSessionResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Request Shopping List Session", () => {
  let user: User;
  let bearerToken: string;
  let shoppingList: ShoppingList;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    shoppingList = await generateShoppingList({ user_id: user.id });
  });

  it("should issue a session token", async () => {
    const response = await request(server).get(`/shopping-list/${shoppingList.id}/session`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const data: RequestShoppingListSessionResponseSchema = response.body;
    expect(data.token).toBeTruthy();
  });

  it("should issue a session token to a shared user", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();

    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });

    const share = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).get(`/shopping-list/${shoppingList.id}/session`).set("Authorization", `Bearer ${otherBearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const data: RequestShoppingListSessionResponseSchema = response.body;
    expect(data.token).toBeTruthy();
  });

  it("should not issue a session token to a non-shared user", async () => {
    const [_, otherBearerToken] = await fixtures.createUserAndToken();

    const response = await request(server).get(`/shopping-list/${shoppingList.id}/session`).set("Authorization", `Bearer ${otherBearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not issue a session token to a shared user where the membership is not accepted", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();

    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "denied",
    });

    const share = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).get(`/shopping-list/${shoppingList.id}/session`).set("Authorization", `Bearer ${otherBearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not issue a session token for a non-existent shopping list", async () => {
    const response = await request(server).get(`/shopping-list/5000000/session`).set("Authorization", `Bearer ${bearerToken}`).send();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
