import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";

describe("Update Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should update a cookbook", async () => {
    const cookbook = await prisma.cookbook.create({
      data: {
        user_id: user.id,
        name: "Test cookbook",
      },
    });

    const response = await request(server)
      .put("/cookbook")
      .send({
        id: cookbook.id,
        description: "new description",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body.name).toEqual(cookbook.name);
    expect(response.body.description).toEqual("new description");
  });

  it("should not allow you to update a cookbook you do not own", async () => {
    const [otherUser] = await fixtures.createUserAndToken({email: "otheruser@recipiece.org"});
    const otherCookbook = await prisma.cookbook.create({
      data: {
        user_id: otherUser.id,
        name: "other user cookbook",
        description: "dont you dare update me",
      },
    });

    const response = await request(server)
      .put("/cookbook")
      .send({
        id: otherCookbook.id,
        description: "new description",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const updatedCookbook = await prisma.cookbook.findUnique({ where: { id: otherCookbook.id } });
    expect(updatedCookbook?.description).toEqual(otherCookbook.description);
  });

  it("should not update a cookbook that does not exist", async () => {
    const response = await request(server)
      .put("/cookbook")
      .send({
        id: 90000000,
        description: "new description",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
