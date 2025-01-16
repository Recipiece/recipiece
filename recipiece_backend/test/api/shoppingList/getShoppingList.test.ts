import { User, prisma } from "@recipiece/database";
import { ShoppingListSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Get Shopping List", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to get a shopping list", async () => {
    const existingShoppingList = await prisma.shoppingList.create({
      data: {
        name: "Test ShoppingList",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .get(`/shopping-list/${existingShoppingList.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const shoppingListBody = response.body as ShoppingListSchema;
    expect(shoppingListBody.id).toEqual(existingShoppingList.id);
  });

  it("should not retrieve a shopping list that is not shared and does not belong to the requesting user", async () => {
    const [otherUser] = await fixtures.createUserAndToken({ email: "otheruser@recipiece.org" });
    const existingShoppingList = await prisma.shoppingList.create({
      data: {
        name: "Test ShoppingList",
        user_id: otherUser.id,
      },
    });

    const response = await request(server)
      .get(`/shopping-list/${existingShoppingList.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a shopping list that does not exist", async () => {
    const response = await request(server).get(`/shopping-list/500000`).set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should get a shared shopping list", async () => {
    const [otherUser] = await fixtures.createUserAndToken({ email: "otheruser@recipiece.org" });
    const othersShoppingList = await prisma.shoppingList.create({
      data: {
        name: "Test ShoppingList",
        user_id: otherUser.id,
      },
    });

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "accepted",
      },
    });

    const share = await prisma.shoppingListShare.create({
      data: {
        shopping_list_id: othersShoppingList.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    // make a membership and share going the other way to ensure we dont pick up stray records
    const mirroredMembership = await prisma.userKitchenMembership.create({
      data: {
        destination_user_id: otherUser.id,
        source_user_id: user.id,
        status: "accepted",
      },
    });

    const usersShoppingList = await prisma.shoppingList.create({
      data: {
        name: "users shoppingList",
        user_id: user.id,
      },
    });

    const usersShoppingListShare = await prisma.shoppingListShare.create({
      data: {
        user_kitchen_membership_id: mirroredMembership.id,
        shopping_list_id: usersShoppingList.id,
      },
    });

    const response = await request(server)
      .get(`/shopping-list/${othersShoppingList.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ShoppingListSchema = response.body;

    expect(responseData.shares?.length).toBe(1);
    expect(responseData.shares![0].id).toBe(share.id);
  });

  it("should not get a shared shopping list where the membership is not accepted", async () => {
    const [otherUser] = await fixtures.createUserAndToken({ email: "otheruser@recipiece.org" });
    const othersShoppingList = await prisma.shoppingList.create({
      data: {
        name: "Test ShoppingList",
        user_id: otherUser.id,
      },
    });

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "denied",
      },
    });

    const share = await prisma.shoppingListShare.create({
      data: {
        shopping_list_id: othersShoppingList.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .get(`/shopping-list/${othersShoppingList.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  })
});
