import { prisma, User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateShoppingList, generateShoppingListShare, generateUserKitchenMembership } from "@recipiece/test";
import { CreateShoppingListShareRequestSchema, ShoppingListShareSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Shopping List Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it.each([true, false])("should allow a user to share a shopping list", async (isUserSourceUser) => {
    const shoppingList = await generateShoppingList({
      user_id: user.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", bearerToken)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    const responseBody: ShoppingListShareSchema = response.body;

    expect(responseBody.shopping_list_id).toBe(shoppingList.id);
    expect(responseBody.user_kitchen_membership_id).toBe(membership.id);

    const record = await prisma.shoppingListShare.findFirst({
      where: {
        id: responseBody.id,
      },
    });
    expect(record).toBeTruthy();
  });

  it("should not allow a user to share a shopping list they do not own", async () => {
    const shoppingList = await generateShoppingList({
      user_id: otherUser.id,
    });
    await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });

    const outsideMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", bearerToken)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: outsideMembership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const record = await prisma.shoppingListShare.findFirst({
      where: {
        shopping_list_id: shoppingList.id,
      },
    });
    expect(record).toBeFalsy();
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not allow a user to share a shopping list to a non-accepted membership", async (membershipStatus) => {
    const shoppingList = await generateShoppingList({
      user_id: otherUser.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: membershipStatus,
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", bearerToken)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const record = await prisma.shoppingListShare.findFirst({
      where: {
        shopping_list_id: shoppingList.id,
      },
    });
    expect(record).toBeFalsy();
  });

  it("should not share a shopping list that does not exist", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", bearerToken)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: 1000000,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow a shopping list to be shared twice to the same membership", async () => {
    const shoppingList = await generateShoppingList({
      user_id: user.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server)
      .post("/shopping-list/share")
      .set("Authorization", bearerToken)
      .send(<CreateShoppingListShareRequestSchema>{
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });
});
