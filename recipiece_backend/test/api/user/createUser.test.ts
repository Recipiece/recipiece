import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create User", () => {
  it("should create a user, their credentials, and their access level", async () => {
    const username = "newuser@recipiece.org";
    const password = "reallyCoolP@ss1234!";

    const response = await request(server)
      .post("/user/create")
      .send({
        username: username,
        password: password,
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(StatusCodes.CREATED);

    const matchingUser = await testPrisma.user.findUnique({
      where: {
        email: username,
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

  it("should not allow a duplicate user to be created", async () => {
    const existingUser = await testPrisma.user.create({
      data: {
        email: "existing@recipiece.org",
      },
    });

    const response = await request(server)
      .post("/user/create")
      .send({
        username: existingUser.email,
        password: "anythingGoes",
      })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });
});
