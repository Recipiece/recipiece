import { User } from "@recipiece/database";
import {
  generateShoppingList,
  generateShoppingListShare,
  generateUser,
  generateUserKitchenMembership,
} from "@recipiece/test";
import { ListMealPlanSharesQuerySchema, ListMealPlanSharesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Shopping List Shares", () => {
  let user: User;
  let userBearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, userBearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it("should list shopping list shares targeting the user", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const userShoppingList = await generateShoppingList({ user_id: user.id });
    const share = await generateShoppingListShare({
      user_kitchen_membership_id: membership.id,
      shopping_list_id: userShoppingList.id,
    });

    const response = await request(server)
      .get(`/shopping-list/share/list`)
      .query(<ListMealPlanSharesQuerySchema>{
        page_number: 0,
        targeting_self: true,
      })
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListMealPlanSharesResponseSchema = response.body;
    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].id).toBe(share.id);
  });

  it("should list shopping list shares originating from the user", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const userShoppingList = await generateShoppingList({ user_id: user.id });
    const share = await generateShoppingListShare({
      user_kitchen_membership_id: membership.id,
      shopping_list_id: userShoppingList.id,
    });

    const response = await request(server)
      .get(`/shopping-list/share/list`)
      .query(<ListMealPlanSharesQuerySchema>{
        page_number: 0,
        from_self: true,
      })
      .set("Authorization", `Bearer ${userBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListMealPlanSharesResponseSchema = response.body;
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
    const shoppingList = await generateShoppingList({ user_id: user.id });
    const userToOtherShare = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: userToOtherMembership.id,
    });
    const userToThirdShare = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: userToThirdMembership.id,
    });

    const response = await request(server)
      .get(`/shopping-list/share/list`)
      .query(<ListMealPlanSharesQuerySchema>{
        page_number: 0,
        from_self: true,
        user_kitchen_membership_id: userToOtherMembership.id,
      })
      .set("Authorization", `Bearer ${userBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListMealPlanSharesResponseSchema = response.body;
    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].id).toBe(userToOtherShare.id);
  });

  it("should only list shares for accepted memberships", async () => {
    const userToOtherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "denied",
    });
    const shoppingList = await generateShoppingList({ user_id: user.id });
    const userToOtherShare = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: userToOtherMembership.id,
    });

    const response = await request(server)
      .get(`/shopping-list/share/list`)
      .query(<ListMealPlanSharesQuerySchema>{
        page_number: 0,
        from_self: true,
      })
      .set("Authorization", `Bearer ${userBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: ListMealPlanSharesResponseSchema = response.body;
    expect(responseData.data.length).toBe(0);
  });
});
