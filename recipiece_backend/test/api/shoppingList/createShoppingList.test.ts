import { User } from "@prisma/client";
// @ts-ignore
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import app from "../../../src/app";
import { createUserAndToken } from "../../fixture";

describe("Create Shopping List", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a shopping list to be created", async () => {
    const expectedBody = {
      name: "My Test List",
    }

    const response = await request(app)
      .post("/shopping-list")
      .send(expectedBody)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CREATED);
    const responseBody = response.body;

    expect(responseBody.id).toBeTruthy();
    expect(responseBody.name).toEqual(expectedBody.name);
    expect(responseBody.user_id).toEqual(user.id);
  });
});
