import { Cookbook, User, prisma } from "@recipiece/database";
import { generateCookbook, generateRecipe, generateRecipeCookbookAttachment } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { generateCookbookWithRecipe } from "./fixtures";

describe("List Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list the cookbooks for the user associated with a token", async () => {
    for (let i = 0; i < 10; i++) {
      await generateCookbook({ user_id: user.id });
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

  it("should allow name filtering", async () => {
    for (let i = 0; i < 10; i++) {
      await generateCookbook({ user_id: user.id });
    }
    const filterCookbook = await generateCookbook({ user_id: user.id, name: "NAME NAME NAME" });

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
    expect(results[0].id).toEqual(filterCookbook.id);
    expect(results[0].name).toEqual(filterCookbook.name);
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await generateCookbook({ user_id: user.id });
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

  it("should exclude cookbooks containing a certain recipe", async () => {
    const notContainingCookbook = await generateCookbook({ user_id: user.id });
    const [_, recipe] = await generateCookbookWithRecipe(user.id);

    const response = await request(server)
      .get("/cookbook/list")
      .query({
        page_number: 0,
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
