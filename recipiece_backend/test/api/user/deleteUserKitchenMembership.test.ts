import { User } from "@prisma/client";
import request from "supertest";
import { prisma } from "../../../src/database";
import { UserKitchenInvitationStatus } from "../../../src/util/constant";
import { StatusCodes } from "http-status-codes";

describe("Delete User Kitchen Membership", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow the targeted user to delete the membership", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: UserKitchenInvitationStatus.PENDING,
      },
    });

    const response = await request(server)
      .delete(`/user/kitchen/membership/${membership.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedMembership = await prisma.userKitchenMembership.findFirst({
      where: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
      },
    });
    expect(deletedMembership).toBeFalsy();
  });

  it("should allow the source user to delete the membership", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: UserKitchenInvitationStatus.PENDING,
      },
    });

    const response = await request(server)
      .delete(`/user/kitchen/membership/${membership.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedMembership = await prisma.userKitchenMembership.findFirst({
      where: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
      },
    });
    expect(deletedMembership).toBeFalsy();
  });
});
