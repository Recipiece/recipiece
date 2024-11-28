import { User } from "@prisma/client";
// @ts-ignore
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Shopping List", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a user to delete their shopping list", async () => {
    const shoppingList = await testPrisma.shoppingList.create({
      data: {
        name: "asdfqwer",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .delete(`/shopping-list/${shoppingList.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const deletedShoppingList = await testPrisma.shoppingList.findUnique({
      where: {
        id: shoppingList.id,
      },
    });
    expect(deletedShoppingList).toBeFalsy();
  });

  it("should not allow a user to delete a shopping list they do not own", async () => {
    const [otherUser] = await fixtures.createUserAndToken("otheruser@recipiece.org");
    const shoppingList = await testPrisma.shoppingList.create({
      data: {
        name: "asdfqwer",
        user_id: otherUser.id,
      },
    });

    const response = await request(server)
      .delete(`/shopping-list/${shoppingList.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const deletedShoppingList = await testPrisma.shoppingList.findUnique({
      where: {
        id: shoppingList.id,
      },
    });
    expect(deletedShoppingList).toBeTruthy();
  });

  it(`should ${StatusCodes.NOT_FOUND} when the recipe does not exist`, async () => {
    const response = await request(server)
      .delete("/shopping-list/5000")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
