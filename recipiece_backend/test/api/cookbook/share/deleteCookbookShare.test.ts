import { User, prisma } from "@recipiece/database";
import { generateCookbook, generateCookbookShare, generateUserKitchenMembership } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Cookbook Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should allow a user to delete their shared cookbook", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const cookbook = await generateCookbook({ user_id: user.id });
    const share = await generateCookbookShare({
      cookbook_id: cookbook.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).delete(`/cookbook/share/${share.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedShare = await prisma.cookbookShare.findFirst({
      where: {
        id: share.id,
      },
    });
    expect(deletedShare).toBeFalsy();
  });

  it("should not allow a user to delete a share they did not make", async () => {
    const [_, thirdUserToken] = await fixtures.createUserAndToken();
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const cookbook = await generateCookbook({ user_id: user.id });
    const share = await generateCookbookShare({
      cookbook_id: cookbook.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).delete(`/cookbook/share/${share.id}`).set("Authorization", `Bearer ${thirdUserToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const deletedShare = await prisma.cookbookShare.findFirst({
      where: {
        id: share.id,
      },
    });
    expect(deletedShare).toBeTruthy();
  });

  it("should not allow a user to delete a share that doesn't exist", async () => {
    const response = await request(server).delete(`/cookbook/share/1000000`).set("Authorization", `Bearer ${bearerToken}`).send();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
