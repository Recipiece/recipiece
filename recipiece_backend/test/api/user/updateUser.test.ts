import { User, prisma } from "@recipiece/database";
import { generateUser } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Update User", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
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
    const [_, otherUserToken] = await fixtures.createUserAndToken();

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

  it("should not allow a duplicate username, case insensitive", async () => {
    const otherUser = await generateUser();
    const response = await request(server).put("/user").set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`).send({
      id: user.id,
      username: otherUser.username.toUpperCase(),
    });

    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });

  it("should not allow a duplicate email, case insensitive", async () => {
    const otherUser = await generateUser();
    const response = await request(server).put("/user").set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`).send({
      id: user.id,
      email: otherUser.email.toUpperCase(),
    });

    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });
});
