import { User, UserKitchenMembership } from "@recipiece/database";
import { generateUser, generateUserKitchenMembership } from "@recipiece/test";
import {
  CreateUserKitchenMembershipRequestSchema,
  ListUserKitchenMembershipsQuerySchema,
  ListUserKitchenMembershipsResponseSchema,
  UpdateUserKitchenMembershipRequestSchema,
  UserKitchenMembershipSchema,
} from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("User Kitchen Membership Schemas", () => {
  let sourceUser: User;
  let destUser: User;
  let sourceBearerToken: string;
  let destBearerToken: string;
  let membership: UserKitchenMembership;

  beforeEach(async () => {
    [sourceUser, sourceBearerToken] = await fixtures.createUserAndToken();
    [destUser, destBearerToken] = await fixtures.createUserAndToken();

    membership = await generateUserKitchenMembership({
      source_user_id: sourceUser.id,
      destination_user_id: destUser.id,
    });
  });

  it("should not display the emails when listing memberships", async () => {
    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        page_number: 0,
        targeting_self: true,
      })
      .set("Authorization", `Bearer ${destBearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: ListUserKitchenMembershipsResponseSchema = response.body;

    expect(responseBody.data.length).toBe(1);
    const bodyMembership = responseBody.data[0];

    const sourceUserKeys = Object.keys(bodyMembership.source_user);
    const destUserKeys = Object.keys(bodyMembership.destination_user);
    expect(sourceUserKeys).not.toContain("email");
    expect(destUserKeys).not.toContain("email");

    expect(bodyMembership.source_user.username).toBe(sourceUser.username);
    expect(bodyMembership.destination_user.username).toBe(destUser.username);
  });

  it("should not display the emails when getting memberships", async () => {
    const response = await request(server)
      .get(`/user-kitchen-membership/${membership.id}`)
      .set("Authorization", `Bearer ${destBearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: UserKitchenMembershipSchema = response.body;

    const sourceUserKeys = Object.keys(responseBody.source_user);
    const destUserKeys = Object.keys(responseBody.destination_user);
    expect(sourceUserKeys).not.toContain("email");
    expect(destUserKeys).not.toContain("email");

    expect(responseBody.source_user.username).toBe(sourceUser.username);
    expect(responseBody.destination_user.username).toBe(destUser.username);
  });

  it("should not display the emails when creating memberships", async () => {
    // a membership already exist from source -> dest, create one going the other way
    const thirdUser = await generateUser();
    const body: CreateUserKitchenMembershipRequestSchema = {
      username: thirdUser.username,
    };
    const response = await request(server)
      .post("/user-kitchen-membership")
      .set("Authorization", `Bearer ${sourceBearerToken}`)
      .send({ ...body });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: UserKitchenMembershipSchema = response.body;

    const sourceUserKeys = Object.keys(responseBody.source_user);
    const destUserKeys = Object.keys(responseBody.destination_user);
    expect(sourceUserKeys).not.toContain("email");
    expect(destUserKeys).not.toContain("email");

    expect(responseBody.source_user.username).toBe(sourceUser.username);
    expect(responseBody.destination_user.username).toBe(thirdUser.username);
  });

  it("should not display the emails when setting membership status", async () => {
    const body: UpdateUserKitchenMembershipRequestSchema = {
      id: membership.id,
      status: membership.status === "accepted" ? "denied" : "accepted",
    };
    const response = await request(server)
      .put("/user-kitchen-membership")
      .set("Authorization", `Bearer ${destBearerToken}`)
      .send({ ...body });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: UserKitchenMembershipSchema = response.body;

    const sourceUserKeys = Object.keys(responseBody.source_user);
    const destUserKeys = Object.keys(responseBody.destination_user);
    expect(sourceUserKeys).not.toContain("email");
    expect(destUserKeys).not.toContain("email");

    expect(responseBody.source_user.username).toBe(sourceUser.username);
    expect(responseBody.destination_user.username).toBe(destUser.username);
  });
});
