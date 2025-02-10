import { User, UserTag } from "@recipiece/database";
import { generateUserTag } from "@recipiece/test";
import { ListUserTagsQuerySchema, ListUserTagsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List User Tags", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list the tags for the user", async () => {
    const tags: UserTag[] = [];

    for (let i = 0; i < 20; i++) {
      tags.push(await generateUserTag({ user_id: user.id }));
    }

    // generate some extra tags that don't belong to the user
    for (let i = 0; i < 5; i++) {
      await generateUserTag();
    }

    const response = await request(server)
      .get("/user/tag/list")
      .set("Authorization", `Bearer ${bearerToken}`)
      .query(<ListUserTagsQuerySchema>{
        page_number: 0,
      })
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody = <ListUserTagsResponseSchema>response.body;

    expect(responseBody.data.length).toBe(tags.length);

    const expectedIds = tags.map((t) => t.id).sort();
    const actualIds = responseBody.data.map((t) => t.id).sort();

    expect(expectedIds).toEqual(actualIds);
    expect(responseBody.has_next_page).toBeFalsy();
    expect(responseBody.page).toBe(0);
  });

  it("should page", async () => {
    for (let i = 0; i < 20; i++) {
      await generateUserTag({ user_id: user.id });
    }

    const response = await request(server)
      .get("/user/tag/list")
      .set("Authorization", `Bearer ${bearerToken}`)
      .query(<ListUserTagsQuerySchema>{
        page_number: 0,
        page_size: 10,
      })
      .send();

    const responseBody = <ListUserTagsResponseSchema>response.body;
    expect(responseBody.data.length).toBe(10);
  });

  it("should search", async () => {
    for (let i = 0; i < 20; i++) {
      await generateUserTag({ user_id: user.id, content: `tag ${i}` });
    }

    const response = await request(server)
      .get("/user/tag/list")
      .set("Authorization", `Bearer ${bearerToken}`)
      .query(<ListUserTagsQuerySchema>{
        page_number: 0,
        search: "9",
      })
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody = <ListUserTagsResponseSchema>response.body;
    expect(responseBody.data.length).toBe(2);

    const dataContent = responseBody.data.map((t) => t.content);
    expect(dataContent.includes("tag 9")).toBeTruthy();
    expect(dataContent.includes("tag 19")).toBeTruthy();
  });
});
