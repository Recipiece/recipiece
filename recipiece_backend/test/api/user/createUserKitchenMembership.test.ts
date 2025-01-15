import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "../../../src/database";
import { UserKitchenInvitationStatus } from "../../../src/util/constant";

describe("Create User Kitchen Memberships", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should not allow a user to create a membership for themselves", async () => {
    const response = await request(server)
      .post("/user/kitchen/membership")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        username: user.username,
      });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should allow a user to create a membership targeting another user", async () => {
    const response = await request(server)
      .post("/user/kitchen/membership")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        username: otherUser.username,
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const invitation = await prisma.userKitchenMembership.findFirst({
      where: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
      },
    });

    expect(invitation).toBeTruthy();
    expect(invitation?.status).toBe(UserKitchenInvitationStatus.PENDING);
  });

  it("should not allow duplicate memberships to be created", async () => {
    await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: UserKitchenInvitationStatus.DENIED,
      },
    });

    const response = await request(server)
      .post("/user/kitchen/membership")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        username: otherUser.username,
      });
    expect(response.statusCode).toBe(StatusCodes.TOO_MANY_REQUESTS);

    const allInvitations = await prisma.userKitchenMembership.findMany({
      where: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
      },
    });
    expect(allInvitations.length).toBe(1);
    expect(allInvitations[0].status).toBe(UserKitchenInvitationStatus.DENIED);
  });

  it("should not allow a user to create a membership for a user that does not exist", async () => {
    const response = await request(server)
      .post("/user/kitchen/membership")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        username: otherUser.username + "asdf",
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow a membership to be created targeting a user who has account_visibility of private", async () => {
    const [privateUser] = await fixtures.createUserAndToken({
      preferences: {
        account_visibility: "private",
      }
    });
    const response = await request(server)
      .post("/user/kitchen/membership")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        username: privateUser.username,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
