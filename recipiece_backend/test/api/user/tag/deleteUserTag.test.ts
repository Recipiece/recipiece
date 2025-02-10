import { prisma, User } from "@recipiece/database";
import { generateUserTag } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete User Tag", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should delete a tag belonging to the user", async () => {
    const tag = await generateUserTag({ user_id: user.id });

    const response = await request(server).delete(`/user/tag/${tag.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedTag = await prisma.userTag.findFirst({
      where: {
        id: tag.id,
      },
    });
    expect(deletedTag).toBeFalsy();
  });

  it("should not delete another users tag", async () => {
    const tag = await generateUserTag();

    const response = await request(server).delete(`/user/tag/${tag.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const deletedTag = await prisma.userTag.findFirst({
      where: {
        id: tag.id,
      },
    });
    expect(deletedTag).toBeTruthy();
  });
});
