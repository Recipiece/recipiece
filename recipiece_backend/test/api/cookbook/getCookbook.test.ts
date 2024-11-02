import { User } from "@prisma/client";
// @ts-ignore
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import app from "../../../src/app";
import { createUserAndToken } from "../../fixture";
import { prisma } from "../../../src/database";

describe("Get Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should get a cookbook", async () => {
    const cookBook = await prisma.cookBook.create({
      data: {
        user_id: user.id,
        name: "test cookbook",
      }
    });

    const response = await request(app)
      .get(`/cookbook/${cookBook.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body.id).toEqual(cookBook.id);
  });

  it("should not get a cookbook that is private that you do not own", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    const cookBook = await prisma.cookBook.create({
      data: {
        user_id: otherUser.id,
        name: "test cookbook",
        private: true,
      }
    });

    const response = await request(app)
      .get(`/cookbook/${cookBook.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should get a public cookbook that you do not own", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    const cookBook = await prisma.cookBook.create({
      data: {
        user_id: otherUser.id,
        name: "test cookbook",
        private: false,
      }
    });

    const response = await request(app)
      .get(`/cookbook/${cookBook.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body.id).toEqual(cookBook.id);
  });

  it("should not get a cookbook that does not exist", async () => {
    const response = await request(app)
    .get("/cookbook/900000000")
    .set("Content-Type", "application/json")
    .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
