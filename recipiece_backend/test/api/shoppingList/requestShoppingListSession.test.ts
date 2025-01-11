import { ShoppingList, User } from "@prisma/client";
import { prisma } from "../../../src/database";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { RequestShoppingListSessionResponseSchema } from "../../../src/schema";

describe("Request Shopping List Session", () => {
  let user: User;
  let bearerToken: string;
  let shoppingList: ShoppingList;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    shoppingList = await prisma.shoppingList.create({
      data: {
        user_id: user.id,
        name: "Test shopping list",
      },
    });
  });

  it("should issue a session token", async () => {
    const response = await request(server)
      .get(`/shopping-list/${shoppingList.id}/session`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const data: RequestShoppingListSessionResponseSchema = response.body;
    expect(data.token).toBeTruthy();
  });

  it("should issue a session token to a shared user", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "accepted",
      },
    });

    const share = await prisma.shoppingListShare.create({
      data: {
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .get(`/shopping-list/${shoppingList.id}/session`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const data: RequestShoppingListSessionResponseSchema = response.body;
    expect(data.token).toBeTruthy();
  });

  it("should not issue a session token to a non-shared user", async () => {
    const [_, otherBearerToken] = await fixtures.createUserAndToken();

    const response = await request(server)
      .get(`/shopping-list/${shoppingList.id}/session`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not issue a session token to a shared user where the membership is not accepted", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "denied",
      },
    });

    const share = await prisma.shoppingListShare.create({
      data: {
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .get(`/shopping-list/${shoppingList.id}/session`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not issue a session token for a non-existent shopping list", async () => {
    const response = await request(server)
      .get(`/shopping-list/5000000/session`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
