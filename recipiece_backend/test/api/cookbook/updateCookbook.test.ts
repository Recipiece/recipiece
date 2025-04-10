import { prisma, User } from "@recipiece/database";
import { generateCookbook } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Update Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should update a cookbook", async () => {
    const cookbook = await generateCookbook({ user_id: user.id });

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
    const otherCookbook = await generateCookbook();

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
