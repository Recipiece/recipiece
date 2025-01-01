import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";

describe("Update User", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a user to update their username", async () => {
    const response = await request(server)
      .put("/user")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        id: user.id,
        username: user.username + "new",
      });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    expect(updatedUser).toBeTruthy();
    expect(updatedUser?.username).toBe(user.username + "new");
  });

  it("should allow a user to update their email", async () => {
    const response = await request(server)
      .put("/user")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        id: user.id,
        email: user.email + "new",
      });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    expect(updatedUser).toBeTruthy();
    expect(updatedUser?.email).toBe(user.email + "new");
  });

  it("should not allow another user to update you", async () => {
    const [otherUser, otherUserToken] = await fixtures.createUserAndToken();

    const response = await request(server)
      .put("/user")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({
        id: user.id,
        email: user.email + "new",
      });

    expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });
});
