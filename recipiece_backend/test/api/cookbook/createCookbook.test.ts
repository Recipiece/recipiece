import { User } from "@recipiece/database";
import { generateCookbook } from "@recipiece/test";
import { CookbookSchema, CreateCookbookRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a cookbook to be created", async () => {
    const expectedBody: CreateCookbookRequestSchema = {
      name: "My Test Cookbook",
      description: "The best recipes ever",
    };

    const response = await request(server).post("/cookbook").send(expectedBody).set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody = response.body as CookbookSchema;

    expect(responseBody.id).toBeTruthy();
    expect(responseBody.name).toEqual(expectedBody.name);
    expect(responseBody.user_id).toEqual(user.id);
  });

  it("should not allow a cookbook with the same name to be created for a user", async () => {
    const existingCookbook = await generateCookbook({ user_id: user.id });
    const response = await request(server)
      .post("/cookbook")
      .send({
        name: existingCookbook.name,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
  });

  it("should not allow a bad body to be passed in", async () => {
    const response = await request(server)
      .post("/cookbook")
      .send({
        name: "YEET",
        non: "sense",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });
});
