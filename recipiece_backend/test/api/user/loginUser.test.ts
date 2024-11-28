import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { LoginResponseSchema } from "../../../src/schema";
import { hashPassword } from "../../../src/util/password";

describe("loginUser", () => {
  it("should allow a user to login with a valid username and password", async () => {
    const password = "test1234";
    const username = "user@recipiece.org";
    const hashedPassword = await hashPassword(password);

    const user = await testPrisma.user.create({
      data: {
        email: username,
      },
    });

    await testPrisma.userCredentials.create({
      data: {
        password_hash: hashedPassword!,
        user_id: user.id,
      },
    });

    const response = await request(server)
      .post("/user/login")
      .send({
        username: username,
        password: password,
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody = response.body as LoginResponseSchema;

    expect(responseBody.access_token).toBeTruthy();
    expect(responseBody.refresh_token).toBeTruthy();
  });

  it("should not allow a login when the password does not match", async () => {
    const password = "test1234";
    const username = "user@recipiece.org";
    const hashedPassword = await hashPassword(password);

    const user = await testPrisma.user.create({
      data: {
        email: username,
      },
    });

    await testPrisma.userCredentials.create({
      data: {
        password_hash: hashedPassword!,
        user_id: user.id,
      },
    });

    const response = await request(server)
      .post("/user/login")
      .send({
        username: username,
        password: "nonsensePassword1234!",
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not allow a login when the user does not exist", async () => {
    const response = await request(server)
      .post("/user/login")
      .send({
        username: "nonsenseUser@recipiece.org",
        password: "nonsensePassword1234!",
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
