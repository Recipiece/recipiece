import { User } from "@prisma/client";
// @ts-ignore
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import app from "../../../src/app";
import { createUserAndToken } from "../../fixture";
import { prisma } from "../../../src/database";

describe("Delete Cookbooks", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should delete a cookbook", async () => {
    const cookbook = await prisma.cookbook.create({
      data: {
        user_id: user.id,
        name: "test cookbook",
      }
    });

    const response = await request(app)
      .delete(`/cookbook/${cookbook.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    
    const deletedCookbook = await prisma.cookbook.findFirst({
      where: {
        id: cookbook.id,
      }
    });
    expect(deletedCookbook).toBeFalsy();
  });

  it("should not delete a cookbook the user does not own", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    const cookbook = await prisma.cookbook.create({
      data: {
        user_id: otherUser.id,
        name: "test cookbook",
      }
    });

    const response = await request(app)
      .delete(`/cookbook/${cookbook.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  
    const deletedCookbook = await prisma.cookbook.findFirst({
      where: {
        id: cookbook.id,
      }
    });
    expect(deletedCookbook).toBeTruthy();
  });

  it("should not delete a cookbook that does not exist", async () => {
    const response = await request(app)
      .delete(`/cookbook/900000000`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
