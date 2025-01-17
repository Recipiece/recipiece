import { ShoppingList, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";
import { ListShoppingListsQuerySchema, ShoppingListSchema } from "../../../src/schema";

describe("List Shopping Lists", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list the shopping lists for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.shoppingList.create({
        data: {
          name: `Test shopping list ${i}`,
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/shopping-list/list")
      .query(<ListShoppingListsQuerySchema>{
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as ShoppingList[];
    expect(results.length).toEqual(10);
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.shoppingList.create({
        data: {
          name: `Test shopping list ${i}`,
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/shopping-list/list")
      .query(<ListShoppingListsQuerySchema>{
        page_number: 1,
        page_size: 5,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as ShoppingList[];
    expect(results.length).toEqual(5);
  });

  it("should list shared shopping lists", async () => {
    const [otherUser] = await fixtures.createUserAndToken();
    // allow otherUser to share a shopping list to user
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "accepted",
      },
    });

    const otherShoppingList = await prisma.shoppingList.create({
      data: {
        name: "Other ShoppingList",
        user_id: otherUser.id,
      },
    });

    await prisma.shoppingListShare.create({
      data: {
        user_kitchen_membership_id: membership.id,
        shopping_list_id: otherShoppingList.id,
      },
    });

    for (let i = 0; i < 10; i++) {
      await prisma.shoppingList.create({
        data: {
          name: `Test shopping list ${i}`,
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/shopping-list/list")
      .query(<ListShoppingListsQuerySchema>{
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseShoppingLists: ShoppingListSchema[] = response.body.data;

    expect(responseShoppingLists.length).toBe(11);
  });

  it("should not list shared shopping lists", async () => {
    const [otherUser] = await fixtures.createUserAndToken();
    // allow otherUser to share a shopping list to user
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "accepted",
      },
    });

    const otherShoppingList = await prisma.shoppingList.create({
      data: {
        name: "Other ShoppingList",
        user_id: otherUser.id,
      },
    });

    await prisma.shoppingListShare.create({
      data: {
        user_kitchen_membership_id: membership.id,
        shopping_list_id: otherShoppingList.id,
      },
    });

    for (let i = 0; i < 10; i++) {
      await prisma.shoppingList.create({
        data: {
          name: `Test shopping list ${i}`,
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/shopping-list/list")
      .query(<ListShoppingListsQuerySchema>{
        page_number: 0,
        shared_shopping_lists: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseShoppingLists: ShoppingListSchema[] = response.body.data;

    expect(responseShoppingLists.length).toBe(10);
    responseShoppingLists.forEach((rcp) => {
      expect(rcp.id).not.toBe(otherShoppingList.id);
    });
  });

  it("should not list shared shopping lists belonging to a non-accepted membership", async () => {
    const [otherUser] = await fixtures.createUserAndToken();
    // allow otherUser to share a shopping list to user
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: otherUser.id,
        destination_user_id: user.id,
        status: "denied",
      },
    });

    const otherShoppingList = await prisma.shoppingList.create({
      data: {
        name: "Other ShoppingList",
        user_id: otherUser.id,
      },
    });

    await prisma.shoppingListShare.create({
      data: {
        user_kitchen_membership_id: membership.id,
        shopping_list_id: otherShoppingList.id,
      },
    });

    for (let i = 0; i < 10; i++) {
      await prisma.shoppingList.create({
        data: {
          name: `Test shopping list ${i}`,
          user_id: user.id,
        },
      });
    }

    const response = await request(server)
      .get("/shopping-list/list")
      .query(<ListShoppingListsQuerySchema>{
        page_number: 0,
        shared_shopping_lists: "exclude",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseShoppingLists: ShoppingListSchema[] = response.body.data;

    expect(responseShoppingLists.length).toBe(10);
    responseShoppingLists.forEach((rcp) => {
      expect(rcp.id).not.toBe(otherShoppingList.id);
    });
  });
});
