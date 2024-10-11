import { Recipe, User } from "@prisma/client";
import { createUserAndToken } from "../../fixture";
import request from "supertest";
import app from "../../../src/app";
import { prisma } from "../../../src/database";
import { StatusCodes } from "http-status-codes";

describe("List Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should list the recipes for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(app)
      .get("/recipe/list")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body as Recipe[];
    expect(results.length).toEqual(10);
  });

  it("should not list private recipes for another user", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: otherUser.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(app)
      .get("/recipe/list")
      .query({
        userId: otherUser.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body as Recipe[];
    expect(results.length).toEqual(5);

    results.forEach((recipe) => {
      expect(recipe.private).toBeFalsy();
    });
  });

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    await prisma.recipe.create({
      data: {
        name: "NAME NAME NAME",
        description: "Test",
        user_id: user.id,
      },
    });

    const response = await request(app)
      .get("/recipe/list")
      .query({
        search: "name",
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body as Recipe[];
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual("NAME NAME NAME");
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await prisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(app)
      .get("/recipe/list")
      .query({
        page: 1,
        pageSize: 5,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body as Recipe[];
    expect(results.length).toEqual(5);
    results.forEach((recipe, idx) => {
      const nameParts = recipe.name.split(" ");
      expect(+nameParts[2]).toEqual(5 + idx);
    })
  });
});
