import { User } from "@recipiece/database";
import { LoginResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Login User", () => {
  let user: User;
  const defaultPassword = "test1234!";

  beforeEach(async () => {
    [user] = await fixtures.createUserAndToken({ password: defaultPassword });
  });

  it("should allow a user to login with a valid email and password", async () => {
    const emailBasicHeader = Buffer.from(`${user.email}:${defaultPassword}`).toString("base64");

    const response = await request(server).post("/user/login").set("Authorization", `Basic ${emailBasicHeader}`).set("Content-Type", "application/json");

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody = response.body as LoginResponseSchema;

    expect(responseBody.access_token).toBeTruthy();
    expect(responseBody.refresh_token).toBeTruthy();
  });

  it("should allow a user to login with a valid username and password", async () => {
    const usernameBasicHeader = Buffer.from(`${user.username}:${defaultPassword}`).toString("base64");

    const response = await request(server).post("/user/login").set("Authorization", `Basic ${usernameBasicHeader}`).set("Content-Type", "application/json");

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody = response.body as LoginResponseSchema;

    expect(responseBody.access_token).toBeTruthy();
    expect(responseBody.refresh_token).toBeTruthy();
  });

  it("should not allow a login when the password does not match", async () => {
    const badPasswordHeader = Buffer.from(`${user.username}:${defaultPassword + "asdf"}`).toString("base64");
    const response = await request(server).post("/user/login").set("Authorization", `Basic ${badPasswordHeader}`).set("Content-Type", "application/json");

    expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
  });

  it("should not allow a login when the user does not exist", async () => {
    const nonsenseHeader = Buffer.from(`${user.username + "asdf"}:${defaultPassword + "asdf"}`).toString("base64");

    const response = await request(server).post("/user/login").set("Authorization", `Basic ${nonsenseHeader}`).set("Content-Type", "application/json");

    expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
  });
});
