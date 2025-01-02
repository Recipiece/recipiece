import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";
import { UserKitchenInvitationStatus } from "../../../src/util/constant";

describe("Set User Kitchen Membership Status", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a targeted user set the status of an membership", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: UserKitchenInvitationStatus.PENDING,
      },
    });

    const response = await request(server)
      .put("/user/kitchen/membership")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send({
        id: membership.id,
        status: UserKitchenInvitationStatus.ACCEPTED,
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const invitation = await prisma.userKitchenMembership.findFirst({
      where: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
      },
    });

    expect(invitation).toBeTruthy();
    expect(invitation?.status).toBe(UserKitchenInvitationStatus.ACCEPTED);
  });

  it("should not allow the source user to modify the status", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: UserKitchenInvitationStatus.PENDING,
      },
    });

    const response = await request(server)
      .put("/user/kitchen/membership")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        id: membership.id,
        status: UserKitchenInvitationStatus.ACCEPTED,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
