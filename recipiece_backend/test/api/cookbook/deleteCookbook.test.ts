import { prisma, User } from "@recipiece/database";
import { generateCookbook } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should delete a cookbook", async () => {
    const cookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server).delete(`/cookbook/${cookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const deletedCookbook = await prisma.cookbook.findFirst({
      where: {
        id: cookbook.id,
      },
    });
    expect(deletedCookbook).toBeFalsy();
  });

  it("should not delete a cookbook the user does not own", async () => {
    const otherCookbook = await generateCookbook();

    const response = await request(server).delete(`/cookbook/${otherCookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const deletedCookbook = await prisma.cookbook.findFirst({
      where: {
        id: otherCookbook.id,
      },
    });
    expect(deletedCookbook).toBeTruthy();
  });

  it("should not delete a cookbook that does not exist", async () => {
    const response = await request(server).delete(`/cookbook/900000000`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
