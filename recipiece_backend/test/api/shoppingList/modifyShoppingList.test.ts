import { prisma, Redis, ShoppingList, ShoppingListItem, User } from "@recipiece/database";
import { generateShoppingListItem } from "@recipiece/test";
import { ModifyShoppingListResponse } from "@recipiece/types";
import { randomUUID } from "crypto";
import "jest-expect-message";
import request from "superwstest";

const setShoppingListToken = async (shoppingListId: number): Promise<string> => {
  const wsToken = randomUUID().toString();
  const redis = await Redis.getInstance();

  await redis.hSet(`ws:${wsToken}`, ["purpose", "/shopping-list/modify", "entity_id", shoppingListId, "entity_type", "modifyShoppingListSession"]);
  await redis.sAdd(`modifyShoppingListSession:${shoppingListId}`, wsToken);

  return wsToken;
};

describe("Modify Shopping List", () => {
  let user: User;
  let bearerToken: string;
  let shoppingList: ShoppingList;
  let wsToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    shoppingList = await prisma.shoppingList.create({
      data: {
        name: "Test List",
        user_id: user.id,
      },
    });
    wsToken = await setShoppingListToken(shoppingList.id);
  });

  afterEach(async () => {
    const redis = await Redis.getInstance();
    await redis.DEL(`modifyShoppingListSession:${shoppingList.id}`);
    await redis.DEL(`ws:${wsToken}`);
  });

  describe("set_item_content", () => {
    it("should update an item's content", async () => {
      const shoppingListItems: ShoppingListItem[] = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: i >= 5,
        });
        shoppingListItems.push(item);
      }

      const itemToUpdate = shoppingListItems[8];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "set_item_content",
          item: { ...itemToUpdate, content: "wholly new content" },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("set_item_content");
          const actualJson = response.items;
          expect(actualJson.length).toBe(10);
          expect(actualJson[0].content).toEqual(shoppingListItems[0].content);
          expect(actualJson[1].content).toEqual(shoppingListItems[1].content);
          expect(actualJson[2].content).toEqual(shoppingListItems[2].content);
          expect(actualJson[3].content).toEqual(shoppingListItems[3].content);
          expect(actualJson[4].content).toEqual(shoppingListItems[4].content);
          expect(actualJson[5].content).toEqual(shoppingListItems[5].content);
          expect(actualJson[6].content).toEqual(shoppingListItems[6].content);
          expect(actualJson[7].content).toEqual(shoppingListItems[7].content);
          expect(actualJson[8].content).toEqual("wholly new content");
          expect(actualJson[9].content).toEqual(shoppingListItems[9].content);
        });
    });

    it("should do nothing to an item not in the shopping list", async () => {
      const shoppingListItems: ShoppingListItem[] = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: i >= 5,
        });
        shoppingListItems.push(item);
      }

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "set_item_content",
          item: {
            id: shoppingListItems[shoppingListItems.length - 1].id + 1,
            content: "wholly new content",
            shopping_list_id: shoppingList.id + 1,
          },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("set_item_content");
          const actualJson = response.items;
          expect(actualJson.length).toBe(10);
          expect(actualJson[0].content).toEqual(shoppingListItems[0].content);
          expect(actualJson[1].content).toEqual(shoppingListItems[1].content);
          expect(actualJson[2].content).toEqual(shoppingListItems[2].content);
          expect(actualJson[3].content).toEqual(shoppingListItems[3].content);
          expect(actualJson[4].content).toEqual(shoppingListItems[4].content);
          expect(actualJson[5].content).toEqual(shoppingListItems[5].content);
          expect(actualJson[6].content).toEqual(shoppingListItems[6].content);
          expect(actualJson[7].content).toEqual(shoppingListItems[7].content);
          expect(actualJson[8].content).toEqual(shoppingListItems[8].content);
          expect(actualJson[9].content).toEqual(shoppingListItems[9].content);
        });
    });
  });

  describe("delete_item", () => {
    it("should remove an item from the list and realign the orders", async () => {
      const shoppingListItems: ShoppingListItem[] = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          completed: i < 5,
          shopping_list_id: shoppingList.id,
        });
        shoppingListItems.push(item);
      }

      const itemToDelete = shoppingListItems[4];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "delete_item",
          item: { ...itemToDelete },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("delete_item");
          const actualJson = response.items;
          expect(actualJson.length).toBe(9);
          expect(actualJson[0].order).toBe(1);
          expect(actualJson[1].order).toBe(2);
          expect(actualJson[2].order).toBe(3);
          expect(actualJson[3].order).toBe(4);
          expect(actualJson[4].order).toBe(5);
          expect(actualJson[5].order).toBe(1);
          expect(actualJson[6].order).toBe(2);
          expect(actualJson[7].order).toBe(3);
          expect(actualJson[8].order).toBe(4);
        });
    });

    it("should not do anything to an item that is not in the list", async () => {
      const shoppingListItems: ShoppingListItem[] = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          completed: i < 5,
          shopping_list_id: shoppingList.id,
        });
        shoppingListItems.push(item);
      }

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "delete_item",
          item: { id: shoppingListItems[shoppingListItems.length - 1].id + 1, shopping_list_id: shoppingList.id + 1 },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("delete_item");
          const actualJson = response.items;
          expect(actualJson.length).toBe(10);
        });
    });
  });

  describe("mark_item_incomplete", () => {
    it("should move an item to not completed status and set its order to count + 1 of the incomplete items", async () => {
      const shoppingListItems = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          completed: i < 5,
          shopping_list_id: shoppingList.id,
        });
        shoppingListItems.push(item);
      }

      // find an item that IS completed, there should be 5 so just pick a random one
      const incompleteItems = shoppingListItems.filter((item) => item.completed);
      const itemToMarkIncomplete = incompleteItems[3];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "mark_item_incomplete",
          item: { ...itemToMarkIncomplete },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("mark_item_incomplete");
          const allItems = response.items;
          // check that the matching item was setup correctly
          const matchingItem = allItems.find((item) => item.id === itemToMarkIncomplete.id);
          expect(matchingItem).toBeTruthy();
          expect(matchingItem!.completed).toBe(false);
          expect(matchingItem!.order).toBe(6);

          // check that the complete items are in a good state
          const incompleteItems = allItems.filter((item) => item.completed);
          expect(incompleteItems.length).toBe(4);
          expect(incompleteItems[0].order).toBe(1);
          expect(incompleteItems[1].order).toBe(2);
          expect(incompleteItems[2].order).toBe(3);
          expect(incompleteItems[3].order).toBe(4);

          // check that the incomplete items are in a good state
          const completeItems = allItems.filter((item) => !item.completed);
          expect(completeItems.length).toBe(6);
          expect(completeItems[0].order).toBe(1);
          expect(completeItems[1].order).toBe(2);
          expect(completeItems[2].order).toBe(3);
          expect(completeItems[3].order).toBe(4);
          expect(completeItems[4].order).toBe(5);
          expect(completeItems[5].order).toBe(6);
        });
    });

    it("should not do anything to an already incomplete item", async () => {
      const shoppingListItems: ShoppingListItem[] = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          completed: i < 5,
          shopping_list_id: shoppingList.id,
        });
        shoppingListItems.push(item);
      }

      // find an item that IS already completed
      const completeItems = shoppingListItems.filter((item) => !item.completed);
      const itemToMarkIncomplete = completeItems[3];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "mark_item_incomplete",
          item: { ...itemToMarkIncomplete },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("mark_item_incomplete");
          const allItems = response.items;
          allItems.forEach((item) => {
            const matchingItem = shoppingListItems.find((originalItem) => item.id === originalItem.id);
            expect(matchingItem).toBeTruthy();
            expect(item.completed).toBe(matchingItem!.completed);
            expect(item.order).toBe(matchingItem!.order);
          });
        });
    });
  });

  describe("mark_item_complete", () => {
    it("should move an item to completed status and set its order to count + 1 of the completed items", async () => {
      const shoppingListItems = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          completed: i < 5,
          shopping_list_id: shoppingList.id,
        });
        shoppingListItems.push(item);
      }

      // find an item that is NOT completed, there should be 5 so just pick a random one
      const incompleteItems = shoppingListItems.filter((item) => !item.completed);
      const itemToMarkComplete = incompleteItems[3];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "mark_item_complete",
          item: { ...itemToMarkComplete },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("mark_item_complete");
          const allItems = response.items;
          // check that the matching item was setup correctly
          const matchingItem = allItems.find((item) => item.id === itemToMarkComplete.id);
          expect(matchingItem).toBeTruthy();
          expect(matchingItem!.completed).toBe(true);
          expect(matchingItem!.order).toBe(6);

          // check that the incomplete items are in a good state
          const incompleteItems = allItems.filter((item) => !item.completed);
          expect(incompleteItems.length).toBe(4);
          expect(incompleteItems[0].order).toBe(1);
          expect(incompleteItems[1].order).toBe(2);
          expect(incompleteItems[2].order).toBe(3);
          expect(incompleteItems[3].order).toBe(4);

          // check that the complete items are in a good state
          const completeItems = allItems.filter((item) => item.completed);
          expect(completeItems.length).toBe(6);
          expect(completeItems[0].order).toBe(1);
          expect(completeItems[1].order).toBe(2);
          expect(completeItems[2].order).toBe(3);
          expect(completeItems[3].order).toBe(4);
          expect(completeItems[4].order).toBe(5);
          expect(completeItems[5].order).toBe(6);
        });
    });

    it("should not do anything to an already completed item", async () => {
      const shoppingListItems: ShoppingListItem[] = [];
      for (let i = 0; i < 10; i++) {
        const item = await generateShoppingListItem({
          completed: i < 5,
          shopping_list_id: shoppingList.id,
        });
        shoppingListItems.push(item);
      }

      // find an item that IS already completed
      const completeItems = shoppingListItems.filter((item) => item.completed);
      const itemToMarkComplete = completeItems[3];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "mark_item_complete",
          item: { ...itemToMarkComplete },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("mark_item_complete");
          const allItems = response.items;
          allItems.forEach((item) => {
            const matchingItem = shoppingListItems.find((originalItem) => item.id === originalItem.id);
            expect(matchingItem).toBeTruthy();
            expect(item.completed).toBe(matchingItem!.completed);
            expect(item.order).toBe(matchingItem!.order);
          });
        });
    });
  });

  describe("add_item", () => {
    it("should allow a user to add an item to the list", async () => {
      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "add_item",
          item: <ShoppingListItem>{
            content: "new item 01",
            completed: false,
            order: 1,
          },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("add_item");
          const allItems = response.items;
          const actualJson = allItems[0];
          expect(actualJson.id).toBeTruthy();
          expect(actualJson.shopping_list_id).toEqual(shoppingList.id);
          expect(actualJson.content).toEqual("new item 01");
          expect(actualJson.order).toEqual(1);
          expect(actualJson.completed).toBe(false);
        });
    });

    it("should set the item count to the max + 1 respective to the completed status", async () => {
      for (let i = 0; i < 5; i++) {
        await generateShoppingListItem({
          completed: false,
          shopping_list_id: shoppingList.id,
        });
      }

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "add_item",
          item: {
            content: "new item",
            completed: false,
          },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("add_item");
          const allItems = response.items;
          const actualJson = allItems[5];
          expect(actualJson).toBeTruthy();
          expect(actualJson.id).toBeTruthy();
          expect(actualJson.shopping_list_id).toEqual(shoppingList.id);
          expect(actualJson.content).toEqual("new item");
          expect(actualJson.order).toEqual(6);
          expect(actualJson.completed).toBe(false);
        });

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .sendJson({
          action: "add_item",
          item: {
            content: "new item completed",
            completed: true,
          },
        })
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("add_item");
          const allItems = response.items;
          const actualJson = allItems[6];
          expect(actualJson).toBeTruthy();
          expect(actualJson.id).toBeTruthy();
          expect(actualJson.shopping_list_id).toEqual(shoppingList.id);
          expect(actualJson.content).toEqual("new item completed");
          expect(actualJson.order).toEqual(1);
          expect(actualJson.completed).toBe(true);
        });
    });
  });

  describe("set_item_order", () => {
    it("should set the order of the item to the count of the items relative to completion status if the order is larger than the number of items", async () => {
      const items: ShoppingListItem[] = [];
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: false,
        });
        items.push(item);
      }
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: true,
        });
        items.push(item);
      }

      const expectedJsonMessage = [
        { ...items[0], order: 1 },
        { ...items[1], order: 2 },
        { ...items[3], order: 3 },
        { ...items[4], order: 4 },
        { ...items[2], order: 5 },
        { ...items[5], order: 1 },
        { ...items[6], order: 2 },
        { ...items[7], order: 3 },
        { ...items[8], order: 4 },
        { ...items[9], order: 5 },
      ];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .send(
          JSON.stringify({
            action: "set_item_order",
            item: {
              ...items[2],
              order: 1000,
            },
          })
        )
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("set_item_order");
          const actualJson = response.items;
          actualJson.forEach((actualItem) => {
            const matchingExpectedItem = expectedJsonMessage.find((item) => item.id === actualItem.id);
            expect(matchingExpectedItem).toBeTruthy();
            expect(actualItem.order).toEqual(matchingExpectedItem!.order);
          });
        });
    });

    it("should set the order of an item to 1 when the requested order is <= 0", async () => {
      const items: ShoppingListItem[] = [];
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          completed: false,
          shopping_list_id: shoppingList.id,
        });
        items.push(item);
      }
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          completed: true,
          shopping_list_id: shoppingList.id,
        });
        items.push(item);
      }

      const expectedJsonMessage = [
        { ...items[2], order: 1 },
        { ...items[0], order: 2 },
        { ...items[1], order: 3 },
        { ...items[3], order: 4 },
        { ...items[4], order: 5 },
        { ...items[5], order: 1 },
        { ...items[6], order: 2 },
        { ...items[7], order: 3 },
        { ...items[8], order: 4 },
        { ...items[9], order: 5 },
      ];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .send(
          JSON.stringify({
            action: "set_item_order",
            item: {
              ...items[2],
              order: 0,
            },
          })
        )
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("set_item_order");
          const actualJson = response.items;
          actualJson.forEach((actualItem) => {
            const matchingExpectedItem = expectedJsonMessage.find((item) => item.id === actualItem.id);
            expect(matchingExpectedItem).toBeTruthy();
            expect(actualItem.order).toEqual(matchingExpectedItem!.order);
          });
        });
    });

    it("should allow a user to move the first item in a shopping list", async () => {
      const items: ShoppingListItem[] = [];
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: false,
        });
        items.push(item);
      }
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: true,
        });
        items.push(item);
      }

      const expectedJsonMessage = [
        { ...items[1], order: 1 },
        { ...items[2], order: 2 },
        { ...items[0], order: 3 },
        { ...items[3], order: 4 },
        { ...items[4], order: 5 },
        { ...items[5], order: 1 },
        { ...items[6], order: 2 },
        { ...items[7], order: 3 },
        { ...items[8], order: 4 },
        { ...items[9], order: 5 },
      ];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .send(
          JSON.stringify({
            action: "set_item_order",
            item: {
              ...items[0],
              order: 3,
            },
          })
        )
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("set_item_order");
          const actualJson = response.items;
          actualJson.forEach((actualItem) => {
            const matchingExpectedItem = expectedJsonMessage.find((item) => item.id === actualItem.id);
            expect(matchingExpectedItem).toBeTruthy();
            expect(actualItem.order).toEqual(matchingExpectedItem!.order);
          });
        });
    });

    it("should allow a user to move the last item in a shopping list", async () => {
      const items: ShoppingListItem[] = [];
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: false,
        });
        items.push(item);
      }
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: true,
        });
        items.push(item);
      }

      const expectedJsonMessage = [
        { ...items[0], order: 1 },
        { ...items[4], order: 2 },
        { ...items[1], order: 3 },
        { ...items[2], order: 4 },
        { ...items[3], order: 5 },
        { ...items[5], order: 1 },
        { ...items[6], order: 2 },
        { ...items[7], order: 3 },
        { ...items[8], order: 4 },
        { ...items[9], order: 5 },
      ];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .send(
          JSON.stringify({
            action: "set_item_order",
            item: {
              ...items[4],
              order: 2,
            },
          })
        )
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("set_item_order");
          const actualJson = response.items;
          actualJson.forEach((actualItem) => {
            const matchingExpectedItem = expectedJsonMessage.find((item) => item.id === actualItem.id);
            expect(matchingExpectedItem).toBeTruthy();
            expect(actualItem.order).toEqual(matchingExpectedItem!.order);
          });
        });
    });

    it("should allow a user to set the order of an item within the shopping list", async () => {
      const items: ShoppingListItem[] = [];
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: false,
        });
        items.push(item);
      }
      for (let i = 0; i < 5; i++) {
        const item = await generateShoppingListItem({
          shopping_list_id: shoppingList.id,
          completed: true,
        });
        items.push(item);
      }

      const expectedJsonMessage = [
        { ...items[0], order: 1 },
        // move index 4 to the second spot
        { ...items[4], order: 2 },
        { ...items[1], order: 3 },
        { ...items[2], order: 4 },
        { ...items[3], order: 5 },
        { ...items[5], order: 1 },
        { ...items[6], order: 2 },
        { ...items[7], order: 3 },
        { ...items[8], order: 4 },
        { ...items[9], order: 5 },
      ];

      await request(server)
        .ws(`/shopping-list/modify?token=${wsToken}`)
        .send(
          JSON.stringify({
            action: "set_item_order",
            item: {
              ...items[4],
              order: 2,
            },
          })
        )
        .expectJson((response: ModifyShoppingListResponse) => {
          expect(response.responding_to_action).toBe("set_item_order");
          const actualJson = response.items;
          actualJson.forEach((actualItem) => {
            const matchingExpectedItem = expectedJsonMessage.find((item) => item.id === actualItem.id);
            expect(matchingExpectedItem).toBeTruthy();
            expect(actualItem.order).toEqual(matchingExpectedItem!.order);
          });
        });
    });
  });
});
