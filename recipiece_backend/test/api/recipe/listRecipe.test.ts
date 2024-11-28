import { Recipe, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should list the recipes for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await testPrisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(server)
      .get("/recipe/list")
      .query({
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(10);
  });

  it("should not list private recipes for another user", async () => {
    const [otherUser] = await fixtures.createUserAndToken("otheruser@recipiece.org");
    for (let i = 0; i < 10; i++) {
      await testPrisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: otherUser.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(server)
      .get("/recipe/list")
      .query({
        user_id: otherUser.id,
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(5);

    results.forEach((recipe) => {
      expect(recipe.private).toBeFalsy();
    });
  });

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await testPrisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    await testPrisma.recipe.create({
      data: {
        name: "NAME NAME NAME",
        description: "Test",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .get("/recipe/list")
      .query({
        search: "name",
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual("NAME NAME NAME");
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await testPrisma.recipe.create({
        data: {
          name: `Test recipe ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(server)
      .get("/recipe/list")
      .query({
        page_number: 1,
        page_size: 5,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Recipe[];
    expect(results.length).toEqual(5);
  });
});
