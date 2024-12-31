import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create User", () => {
  it("should create a user, their credentials, and their access level", async () => {
    const email = "newuser@recipiece.org";
    const username = "testuser";
    const password = "reallyCoolP@ss1234!";

    const response = await request(server)
      .post("/user")
      .send({
        email: email,
        username: username,
        password: password,
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(StatusCodes.CREATED);

    const matchingUser = await testPrisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        user_access_records: true,
        credentials: true,
      },
    });

    expect(matchingUser).toBeTruthy();
    expect(matchingUser?.validated).toBe(false);
    expect(matchingUser?.credentials).toBeTruthy();
    expect(matchingUser?.user_access_records).toBeTruthy();
  });

  it("should not allow an existing email to be used", async () => {
    const existingUser = await testPrisma.user.create({
      data: {
        email: "existing@recipiece.org",
        username: "uniqueusername",
      },
    });

    const response = await request(server)
      .post("/user")
      .send({
        username: "ajsdhfjkashdklf",
        email: existingUser.email,
        password: "anythingGoes",
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should not allow an existing username to be used", async () => {
    const existingUser = await testPrisma.user.create({
      data: {
        email: "existing@recipiece.org",
        username: "uniqueusername",
      },
    });

    const response = await request(server)
      .post("/user")
      .send({
        email: "yeet@asdf.qwer",
        username: existingUser.username,
        password: "anythingGoes",
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });
});
