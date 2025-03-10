import { prisma, User } from "@recipiece/database";
import {
  generateShoppingList,
  generateUser,
  generateUserKitchenMembership
} from "@recipiece/test";
import { ShoppingListSchema, UpdateShoppingListRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Update Shopping List", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should update the shopping list", async () => {
    const shoppingList = await generateShoppingList({ user_id: user.id });
    const updateBody: UpdateShoppingListRequestSchema = {
      name: "new name",
      id: shoppingList.id,
    };

    const response = await request(server)
      .put("/shopping-list")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...updateBody });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: ShoppingListSchema = response.body;

    expect(responseBody.name).toBe(updateBody.name);

    const updatedRecord = await prisma.shoppingList.findFirst({
      where: {
        id: shoppingList.id,
      },
    });
    expect(updatedRecord).toBeTruthy();
    expect(updatedRecord!.name).toBe(updateBody.name);
  });

  it("should not update a shopping list that does not exist", async () => {
    const updateBody: UpdateShoppingListRequestSchema = {
      name: "new name",
      id: 10000000,
    };

    const response = await request(server)
      .put("/shopping-list")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...updateBody });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow a shared user to update a shopping list", async () => {
    const otherUser = await generateUser();
    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });
    const shoppingList = await generateShoppingList({ user_id: otherUser.id });

    const updateBody: UpdateShoppingListRequestSchema = {
      name: "new name",
      id: shoppingList.id,
    };

    const response = await request(server)
      .put("/shopping-list")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...updateBody });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const updatedRecord = await prisma.shoppingList.findFirst({
      where: {
        id: shoppingList.id,
      },
    });
    expect(updatedRecord).toBeTruthy();
    expect(updatedRecord!.name).toBe(shoppingList.name);
  });

  it("should not allow another user to update your shopping list", async () => {
    const otherUser = await generateUser();
    const shoppingList = await generateShoppingList({ user_id: otherUser.id });

    const updateBody: UpdateShoppingListRequestSchema = {
      name: "new name",
      id: shoppingList.id,
    };

    const response = await request(server)
      .put("/shopping-list")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...updateBody });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const updatedRecord = await prisma.shoppingList.findFirst({
      where: {
        id: shoppingList.id,
      },
    });
    expect(updatedRecord).toBeTruthy();
    expect(updatedRecord!.name).toBe(shoppingList.name);
  });
});
