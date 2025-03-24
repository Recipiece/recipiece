import { prisma, User } from "@recipiece/database";
import { generateShoppingList, generateShoppingListShare, generateUserKitchenMembership } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Shopping List Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it.each([true, false])("should allow any user involved in the membership to delete the share", async (isUserSourceUser) => {
    const shoppingList = await generateShoppingList({
      user_id: user.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });
    const share = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).delete(`/shopping-list/share/${share.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const record = await prisma.shoppingListShare.findFirst({
      where: {
        id: share.id,
      },
    });
    expect(record).toBeFalsy();
  });

  it("should not allow a user not involved in the membership to delete the share", async () => {
    const shoppingList = await generateShoppingList({
      user_id: user.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const share = await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    const [_, thirdBearerToken] = await fixtures.createUserAndToken();

    const response = await request(server).delete(`/shopping-list/share/${share.id}`).set("Authorization", `Bearer ${thirdBearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const record = await prisma.shoppingListShare.findFirst({
      where: {
        id: share.id,
      },
    });
    expect(record).toBeTruthy();
  });

  it("should not delete a share that does not exist", async () => {
    const response = await request(server).delete(`/shopping-list/share/5000000`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
