import { User, prisma } from "@recipiece/database";
import request from "supertest";
import { StatusCodes } from "http-status-codes";

describe("Delete Recipe Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should allow a user to delete their shared recipe", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "accepted",
      },
    });

    const recipe = await prisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      },
    });

    const share = await prisma.recipeShare.create({
      data: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .delete(`/recipe/share/${share.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedShare = await prisma.recipeShare.findFirst({
      where: {
        id: share.id,
      },
    });
    expect(deletedShare).toBeFalsy();
  });

  it("should not allow a user to delete a share they did not make", async () => {
    const [_, thirdUserToken] = await fixtures.createUserAndToken();

    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "accepted",
      },
    });

    const recipe = await prisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      },
    });

    const share = await prisma.recipeShare.create({
      data: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .delete(`/recipe/share/${share.id}`)
      .set("Authorization", `Bearer ${thirdUserToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const deletedShare = await prisma.recipeShare.findFirst({
      where: {
        id: share.id,
      },
    });
    expect(deletedShare).toBeTruthy();
  });

  it("should not allow a user to delete a share that doesn't exist", async () => {
    const response = await request(server)
      .delete(`/recipe/share/1000000`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
