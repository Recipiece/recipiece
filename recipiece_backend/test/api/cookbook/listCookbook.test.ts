import { Cookbook, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should list the cookbooks for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await testPrisma.cookbook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Cookbook[];
    expect(results.length).toEqual(10);
  });

  it("should not list private cookbooks for another user", async () => {
    const [otherUser] = await fixtures.createUserAndToken("otheruser@recipiece.org");
    for (let i = 0; i < 10; i++) {
      await testPrisma.cookbook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: otherUser.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        user_id: otherUser.id,
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Cookbook[];
    expect(results.length).toEqual(5);

    results.forEach((cookbook) => {
      expect(cookbook.private).toBeFalsy();
    });
  });

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await testPrisma.cookbook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    await testPrisma.cookbook.create({
      data: {
        name: "NAME NAME NAME",
        description: "Test",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        search: "name",
        page_number: 0,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Cookbook[];
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual("NAME NAME NAME");
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await testPrisma.cookbook.create({
        data: {
          name: `Test cookbook ${i}`,
          description: "Test",
          user_id: user.id,
          private: i % 2 === 0,
        },
      });
    }

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        page_number: 1,
        page_size: 5,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const results = response.body.data as Cookbook[];
    expect(results.length).toEqual(5);
  });

  it("should exclude cookbooks containing a certain recipe when instructed", async () => {
    const containingCookbook = await testPrisma.cookbook.create({
      data: {
        name: "Containing",
        user_id: user.id,
      },
    });

    const notContainingCookbook = await testPrisma.cookbook.create({
      data: {
        name: "Not Containing",
        user_id: user.id,
      },
    });

    const recipe = await testPrisma.recipe.create({
      data: {
        name: "Test Recipe",
        user_id: user.id,
      },
    });

    await testPrisma.recipeCookbookAttachment.create({
      data: {
        cookbook_id: containingCookbook.id,
        recipe_id: recipe.id,
      },
    });

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        page_number: 1,
        exclude_containing_recipe_id: recipe.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    const data: Cookbook[] = response.body.data;

    expect(data.length).toBe(1);
    expect(data[0].id).toBe(notContainingCookbook.id);
  });
});
