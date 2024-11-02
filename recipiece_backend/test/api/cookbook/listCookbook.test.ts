import { CookBook, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import app from "../../../src/app";
import { prisma } from "../../../src/database";
import { createUserAndToken } from "../../fixture";

describe("List Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should list the cookbooks for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.cookBook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(app).get("/cookbook/list").set("Content-Type", "application/json").set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as CookBook[];
    expect(results.length).toEqual(10);
  });

  it("should not list private cookbooks for another user", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    for (let i = 0; i < 10; i++) {
      await prisma.cookBook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: otherUser.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(app)
      .get("/cookbook/list")
      .query({
        userId: otherUser.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as CookBook[];
    expect(results.length).toEqual(5);

    results.forEach((cookbook) => {
      expect(cookbook.private).toBeFalsy();
    });
  });

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.cookBook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    await prisma.cookBook.create({
      data: {
        name: "NAME NAME NAME",
        description: "Test",
        user_id: user.id,
      },
    });

    const response = await request(app)
      .get("/cookbook/list")
      .query({
        search: "name",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as CookBook[];
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual("NAME NAME NAME");
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.cookBook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(app)
      .get("/cookbook/list")
      .query({
        page: 1,
        pageSize: 5,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as CookBook[];
    expect(results.length).toEqual(5);
  });
});
