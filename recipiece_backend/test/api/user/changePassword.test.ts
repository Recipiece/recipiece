import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";

describe("Change Password", () => {
  let user: User;
  let basicHeader: string;
  const defaultPassword = "test1234!";

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken({
      password: defaultPassword,
    });
    user = userAndToken[0];

    const encoded = Buffer.from(`${user.username}:${defaultPassword}`).toString("base64");
    basicHeader = `Basic ${encoded}`;
  });

  it("should allow a user to change their password", async () => {
    const priorCredentials = await prisma.userCredentials.findFirst({
      where: {
        user_id: user.id,
      }
    });
    expect(priorCredentials).toBeTruthy();

    const response = await request(server).post("/user/change-password").set("Authorization", basicHeader).send({
      new_password: "1234test!",
    });
    expect(response.statusCode).toBe(StatusCodes.OK);
    
    const newCredentials = await prisma.userCredentials.findFirst({
      where: {
        user_id: user.id,
      }
    });
    expect(newCredentials).toBeTruthy();
    expect(newCredentials!.password_hash).not.toEqual(priorCredentials!.password_hash);
  });

  it("should delete a users sessions when the password is changed", async () => {
    const priorSessions = await prisma.userSession.findMany({
      where: {
        user_id: user.id,
      }
    });
    expect(priorSessions.length).toBe(1);

    const response = await request(server).post("/user/change-password").set("Authorization", basicHeader).send({
      new_password: "1234test!",
    });
    expect(response.statusCode).toBe(StatusCodes.OK);

    const afterSessions = await prisma.userSession.findMany({
      where: {
        user_id: user.id,
      }
    });
    expect(afterSessions.length).toBe(0);
  });
});
