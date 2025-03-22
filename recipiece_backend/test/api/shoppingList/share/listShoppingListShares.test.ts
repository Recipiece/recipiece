import { User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateShoppingList, generateShoppingListShare, generateUserKitchenMembership } from "@recipiece/test";
import { ListShoppingListSharesQuerySchema, ListShoppingListSharesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Shopping List Shares", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it.each([true, false])("should list shares from the user", async (isUserSourceUser) => {
    const shoppingLists = [];
    for (let i = 0; i < 5; i++) {
      shoppingLists.push(await generateShoppingList({ user_id: user.id }));
    }

    // make some noise
    await generateShoppingList();
    await generateShoppingList();

    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const shares = [];
    for (let shoppingList of shoppingLists) {
      shares.push(
        await generateShoppingListShare({
          shopping_list_id: shoppingList.id,
          user_kitchen_membership_id: membership.id,
        })
      );
    }

    const otherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    for (let shoppingList of shoppingLists) {
      shares.push(
        await generateShoppingListShare({
          shopping_list_id: shoppingList.id,
          user_kitchen_membership_id: otherMembership.id,
        })
      );
    }

    const response = await request(server)
      .get("/shopping-list/share/list")
      .query(<ListShoppingListSharesQuerySchema>{
        from_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: ListShoppingListSharesResponseSchema = response.body;

    expect(responseBody.data.length).toBe(10);

    const actualIds = responseBody.data.map((sh) => sh.id).sort();
    const expectedIds = shares.map((sh) => sh.id).sort();

    expect(actualIds).toEqual(expectedIds);
  });

  it.each([true, false])("should list shares targeting the user", async (isUserSourceUser) => {
    const shoppingLists = [];
    for (let i = 0; i < 5; i++) {
      shoppingLists.push(await generateShoppingList({ user_id: user.id }));
    }

    // make some noise
    await generateShoppingList();
    await generateShoppingList();

    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const shares = [];
    for (let shoppingList of shoppingLists) {
      shares.push(
        await generateShoppingListShare({
          shopping_list_id: shoppingList.id,
          user_kitchen_membership_id: membership.id,
        })
      );
    }

    // let the user share these shopping lists with another user
    const otherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    for (let shoppingList of shoppingLists) {
      await generateShoppingListShare({
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: otherMembership.id,
      });
    }

    const response = await request(server)
      .get("/shopping-list/share/list")
      .query(<ListShoppingListSharesQuerySchema>{
        targeting_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: ListShoppingListSharesResponseSchema = response.body;

    expect(responseBody.data.length).toBe(5);

    const actualIds = responseBody.data.map((sh) => sh.id).sort();
    const expectedIds = shares.map((sh) => sh.id).sort();

    expect(actualIds).toEqual(expectedIds);
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])(
    "should not list shares belonging to a membership with status %o",
    async (membershipStatus) => {
      const shoppingLists = [];
      for (let i = 0; i < 3; i++) {
        shoppingLists.push(await generateShoppingList({ user_id: user.id }));
      }

      // make some noise
      await generateShoppingList();
      await generateShoppingList();

      const membership = await generateUserKitchenMembership({
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: membershipStatus,
      });

      const shares = [];
      for (let shoppingList of shoppingLists) {
        shares.push(
          await generateShoppingListShare({
            shopping_list_id: shoppingList.id,
            user_kitchen_membership_id: membership.id,
          })
        );
      }

      const response = await request(server)
        .get("/shopping-list/share/list")
        .query(<ListShoppingListSharesQuerySchema>{
          from_self: true,
          page_number: 0,
        })
        .set("Authorization", `Bearer ${bearerToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.OK);

      const responseBody: ListShoppingListSharesResponseSchema = response.body;

      expect(responseBody.data.length).toBe(0);
    }
  );

  it.each([true, false])("should list shares belonging only to a single membership", async (isUserSourceUser) => {
    const shoppingLists = [];
    for (let i = 0; i < 5; i++) {
      shoppingLists.push(await generateShoppingList({ user_id: user.id }));
    }

    // make some noise
    await generateShoppingList();
    await generateShoppingList();

    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const shares = [];
    for (let shoppingList of shoppingLists) {
      shares.push(
        await generateShoppingListShare({
          shopping_list_id: shoppingList.id,
          user_kitchen_membership_id: membership.id,
        })
      );
    }

    // let the user share these shopping lists with another user
    const otherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    for (let shoppingList of shoppingLists) {
      await generateShoppingListShare({
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: otherMembership.id,
      });
    }

    const response = await request(server)
      .get("/shopping-list/share/list")
      .query(<ListShoppingListSharesQuerySchema>{
        from_self: true,
        page_number: 0,
        user_kitchen_membership_id: membership.id,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: ListShoppingListSharesResponseSchema = response.body;

    expect(responseBody.data.length).toBe(5);

    const actualIds = responseBody.data.map((sh) => sh.id).sort();
    const expectedIds = shares.map((sh) => sh.id).sort();

    expect(actualIds).toEqual(expectedIds);
  });
});
