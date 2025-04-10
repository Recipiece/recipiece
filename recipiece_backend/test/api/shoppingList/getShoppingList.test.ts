import { User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateShoppingList, generateShoppingListShare, generateUserKitchenMembership } from "@recipiece/test";
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
    const existingShoppingList = await generateShoppingList({ user_id: user.id });

    const response = await request(server).get(`/shopping-list/${existingShoppingList.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const shoppingListBody = response.body as ShoppingListSchema;
    expect(shoppingListBody.id).toEqual(existingShoppingList.id);
  });

  it("should not retrieve a shopping list that is not shared and does not belong to the requesting user", async () => {
    const existingShoppingList = await generateShoppingList();

    const response = await request(server).get(`/shopping-list/${existingShoppingList.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a shopping list that does not exist", async () => {
    const response = await request(server).get(`/shopping-list/500000`).set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it.each([true, false])("should get a shared shopping list when user is source user is %o", async (isUserSourceUser) => {
    const othersShoppingList = await generateShoppingList();
    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : othersShoppingList.user_id,
      destination_user_id: isUserSourceUser ? othersShoppingList.user_id : user.id,
      status: "accepted",
    });
    const share = await generateShoppingListShare({
      shopping_list_id: othersShoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).get(`/shopping-list/${othersShoppingList.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ShoppingListSchema = response.body;

    expect(responseData.shares?.length).toBe(1);
    expect(responseData.shares![0].id).toBe(share.id);
    expect(responseData.shares![0].shopping_list_id).toBe(othersShoppingList.id);
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not get a shared shopping list where the membership has a status of %o", async (status) => {
    const otherShoppingList = await generateShoppingList();

    const membership = await generateUserKitchenMembership({
      source_user_id: otherShoppingList.user_id,
      destination_user_id: user.id,
      status: status,
    });

    const share = await generateShoppingListShare({
      shopping_list_id: otherShoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).get(`/shopping-list/${otherShoppingList.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
