import { User } from "@prisma/client";
import { prisma } from "../../../src/database";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { UserKitchenMembershipSchema } from "../../../src/schema";

describe("Get User Kitchen Membership", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it("should get a membership where the source user is the requesting user", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "pending",
      },
    });

    const response = await request(server)
      .get(`/user/kitchen/membership/${membership.id}`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: UserKitchenMembershipSchema = response.body;

    expect(responseData.id).toBe(membership.id);
    expect(responseData.status).toBe(membership.status);
  });

  it("should get a membership where the destination user is the requesting user", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "pending",
      },
    });

    const response = await request(server)
      .get(`/user/kitchen/membership/${membership.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: UserKitchenMembershipSchema = response.body;

    expect(responseData.id).toBe(membership.id);
    expect(responseData.status).toBe(membership.status);
  });

  it("should not get a membership the requesting user is not a part of", async () => {
    const [thirdUser] = await fixtures.createUserAndToken();
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: thirdUser.id,
        status: "pending",
      },
    });

    const response = await request(server)
      .get(`/user/kitchen/membership/${membership.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not get a membership that does not exist", async () => {
    const response = await request(server)
      .get(`/user/kitchen/membership/100000000`)
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
