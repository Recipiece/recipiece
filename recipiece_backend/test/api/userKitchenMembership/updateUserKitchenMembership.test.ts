import { prisma, User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateUserKitchenMembership } from "@recipiece/test";
import { UpdateUserKitchenMembershipRequestSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Update User Kitchen Membership", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it.each(<UserKitchenMembershipStatus[]>["accepted", "denied"])("should allow the targeted user to change the status from pending", async (newStatus) => {
    const membership = await generateUserKitchenMembership({
      destination_user_id: user.id,
      status: "pending",
    });

    const response = await request(server)
      .put("/user-kitchen-membership")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<UpdateUserKitchenMembershipRequestSchema>{
        id: membership.id,
        status: newStatus,
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const updatedBody: UserKitchenMembershipSchema = response.body;

    expect(updatedBody.status).toBe(newStatus);

    const updatedRecord = await prisma.userKitchenMembership.findFirst({
      where: {
        id: membership.id,
      },
    });
    expect(updatedRecord).toBeTruthy();
    expect(updatedRecord!.status).toBe(newStatus);
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not allow the source user to change the status to accepted", async (oldStatus) => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: oldStatus,
    });

    const response = await request(server)
      .put("/user-kitchen-membership")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<UpdateUserKitchenMembershipRequestSchema>{
        id: membership.id,
        status: "accepted",
      });
    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);

    const dbMembership = await prisma.userKitchenMembership.findFirst({
      where: {
        source_user_id: user.id,
      },
    });
    expect(dbMembership?.status).toBe(oldStatus);
  });

  it("should not allow a user to change the status to pending", async () => {
    const membership = await generateUserKitchenMembership({
      destination_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server).put("/user-kitchen-membership").set("Authorization", `Bearer ${bearerToken}`).send({
      id: membership.id,
      status: "pending",
    });

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    const updatedRecord = await prisma.userKitchenMembership.findFirst({
      where: {
        id: membership.id,
      },
    });
    expect(updatedRecord).toBeTruthy();
    expect(updatedRecord!.status).toBe(membership.status);
  });

  it("should not allow you to modify the status of a membership that is not targeting you", async () => {
    const membership = await generateUserKitchenMembership({
      status: "pending",
    });

    const response = await request(server).put("/user-kitchen-membership").set("Authorization", `Bearer ${bearerToken}`).send({
      id: membership.id,
      status: "accepted",
    });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const updatedRecord = await prisma.userKitchenMembership.findFirst({
      where: {
        id: membership.id,
      },
    });
    expect(updatedRecord).toBeTruthy();
    expect(updatedRecord!.status).toBe(membership.status);
  });

  it("should not allow you to modify a membership that does not exist", async () => {
    const response = await request(server)
      .put(`/user-kitchen-membership`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<UpdateUserKitchenMembershipRequestSchema>{
        id: 10000000,
        status: "accepted",
      });
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
