import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../../src/database";
import { CreateShoppingListShareRequestSchema, ShoppingListShareSchema } from "../../../../src/schema";

describe("Create Shopping List Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should allow a user to share a shopping list from one user to another", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "accepted",
      },
    });

    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: "test shopping list",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const bodyShare = response.body as ShoppingListShareSchema;
    expect(bodyShare.shopping_list_id).toBe(shoppingList.id);
    expect(bodyShare.user_kitchen_membership_id).toBe(membership.id);

    const createdShare = await prisma.shoppingListShare.findFirst({
      where: {
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeTruthy();
  });

  it("should not allow a duplicate share", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "accepted",
      },
    });

    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: "test shopping list",
        user_id: user.id,
      },
    });

    await prisma.shoppingListShare.create({
      data: {
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });

  it("should not allow a share to a kitchen membership that is not accepted", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "pending",
      },
    });

    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: "test shopping list",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.shoppingListShare.findFirst({
      where: {
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a kitchen membership that does not exist", async () => {
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: "test shopping list",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: 100000,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.shoppingListShare.findFirst({
      where: {
        shopping_list_id: shoppingList.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a shopping list that does not exist", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "pending",
      },
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: 1000000,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.shoppingListShare.findFirst({
      where: {
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a shopping list that the requesting user does not own", async () => {
    const [thirdUser] = await fixtures.createUserAndToken();

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "pending",
      },
    });

    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: "test shopping list",
        user_id: thirdUser.id,
      },
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.shoppingListShare.findFirst({
      where: {
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });
});
