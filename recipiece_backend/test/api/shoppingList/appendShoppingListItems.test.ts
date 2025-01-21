import { ShoppingListItem, User, prisma } from "@recipiece/database";
import { generateShoppingList, generateShoppingListItem, generateShoppingListShare, generateUserKitchenMembership } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Append Shopping List Items", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should not allow another user to append items", async () => {
    const [_, otherBearerToken] = await fixtures.createUserAndToken();
    const shoppingList = await generateShoppingList({ user_id: user.id });

    const appendedItem: Partial<ShoppingListItem> = {
      content: "appended",
    };

    const response = await request(server)
      .post("/shopping-list/append-items")
      .send({
        shopping_list_id: shoppingList.id,
        items: [{ ...appendedItem }],
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${otherBearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const listItems = await prisma.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingList.id,
      },
    });
    expect(listItems.length).toBe(0);
  });

  it("should allow a shared user to append items", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
    const shoppingList = await generateShoppingList({ user_id: user.id });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const share = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const appendedItem: Partial<ShoppingListItem> = {
      content: "appended",
    };
    const response = await request(server)
      .post("/shopping-list/append-items")
      .send({
        shopping_list_id: shoppingList.id,
        items: [{ ...appendedItem }],
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${otherBearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);

    const listItems = await prisma.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingList.id,
      },
    });
    expect(listItems.length).toBe(1);
    expect(listItems[0].content).toBe(appendedItem.content);
  });

  it("should not allow a shared user to append items when the membership is not accepted", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
    const shoppingList = await generateShoppingList({ user_id: user.id });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "denied",
    });
    const share = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const appendedItem: Partial<ShoppingListItem> = {
      content: "appended",
    };
    const response = await request(server)
      .post("/shopping-list/append-items")
      .send({
        shopping_list_id: shoppingList.id,
        items: [{ ...appendedItem }],
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${otherBearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const listItems = await prisma.shoppingListItem.findMany({
      where: {
        shopping_list_id: shoppingList.id,
      },
    });
    expect(listItems.length).toBe(0);
  });

  it("should append the items to the end of the incomplete items", async () => {
    const shoppingList = await generateShoppingList({ user_id: user.id });

    const items: ShoppingListItem[] = [];
    for (let i = 0; i < 10; i++) {
      const item = await generateShoppingListItem({
        completed: i >= 5,
        shopping_list_id: shoppingList.id,
      })
      items.push(item);
    }

    const appendedItem: Partial<ShoppingListItem> = {
      content: "appended",
    };

    const response = await request(server)
      .post("/shopping-list/append-items")
      .send({
        shopping_list_id: shoppingList.id,
        items: [{ ...appendedItem }],
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody: ShoppingListItem[] = response.body;
    expect(responseBody.length).toBe(11);

    const knownIds: { [key: string]: ShoppingListItem } = items.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.id.toString()]: curr,
      };
    }, {});

    const matchingItems = responseBody.filter((item) => !!knownIds[item.id.toString()]);
    expect(matchingItems.length).toBe(10);
    matchingItems.forEach((item) => {
      expect(item.order).toBe(knownIds[item.id].order);
    });

    const nonMatchingItems = responseBody.filter((item) => !knownIds[item.id.toString()]);
    expect(nonMatchingItems.length).toBe(1);
    const newItem = nonMatchingItems[0];
    expect(newItem.order).toBe(6);
    expect(newItem.completed).toBe(false);
    expect(newItem.shopping_list_id).toBe(shoppingList.id);
  });
});
