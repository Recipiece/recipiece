import { User, prisma } from "@recipiece/database";
import { generateCookbook } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Get Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should get a cookbook", async () => {
    const cookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server).get(`/cookbook/${cookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body.id).toEqual(cookbook.id);
  });

  it("should not get a cookbook that you do not own", async () => {
    const otherCookbook = await generateCookbook();

    const response = await request(server).get(`/cookbook/${otherCookbook.id}`).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a cookbook that does not exist", async () => {
    const response = await request(server).get("/cookbook/900000000").set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
