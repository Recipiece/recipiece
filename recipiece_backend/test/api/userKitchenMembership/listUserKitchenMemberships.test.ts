import { User } from "@recipiece/database";
import { generateShoppingList, generateShoppingListShare, generateUserKitchenMembership } from "@recipiece/test";
import { ListUserKitchenMembershipsQuerySchema, ListUserKitchenMembershipsResponseSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { UserKitchenInvitationStatus } from "../../../src/util/constant";

describe("List User Kitchen Memberships", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should list memberships", async () => {
    for (let i = 0; i < 10; i++) {
      await generateUserKitchenMembership({
        source_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    for (let i = 0; i < 10; i++) {
      await generateUserKitchenMembership({
        destination_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        from_self: true,
        targeting_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(20);
  });

  it("should list only memberships targeting the user", async () => {
    for (let i = 0; i < 10; i++) {
      await generateUserKitchenMembership({
        source_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    for (let i = 0; i < 10; i++) {
      await generateUserKitchenMembership({
        destination_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        targeting_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(10);
    responseData.forEach((membership: UserKitchenMembershipSchema) => {
      expect(membership.destination_user.id).toBe(user.id);
      expect(membership.source_user.id).not.toBe(user.id);
    });
  });

  it("should list memberships originating from the user", async () => {
    for (let i = 0; i < 10; i++) {
      await generateUserKitchenMembership({
        source_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    for (let i = 0; i < 10; i++) {
      await generateUserKitchenMembership({
        destination_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        from_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(10);
    responseData.forEach((membership: UserKitchenMembershipSchema) => {
      expect(membership.source_user.id).toBe(user.id);
      expect(membership.destination_user.id).not.toBe(user.id);
    });
  });

  it("should list memberships with a subset of statuses", async () => {
    for (let i = 0; i < UserKitchenInvitationStatus.ALL_STATUSES.length * 4; i++) {
      await generateUserKitchenMembership({
        source_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    for (let i = 0; i < UserKitchenInvitationStatus.ALL_STATUSES.length * 4; i++) {
      await generateUserKitchenMembership({
        destination_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    const totalNumMemberships = UserKitchenInvitationStatus.ALL_STATUSES.length * 4 * 2;

    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query({
        from_self: true,
        targeting_self: true,
        status: [UserKitchenInvitationStatus.PENDING, UserKitchenInvitationStatus.DENIED].join(","),
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(totalNumMemberships * (2 / UserKitchenInvitationStatus.ALL_STATUSES.length));
  });

  it("should not allow you to not specify one of from_self or targeting_self", async () => {
    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      await generateUserKitchenMembership({
        source_user_id: user.id,
        status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
      });
    }

    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        from_self: true,
        targeting_self: true,
        page_number: 1,
        page_size: 5,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(5);
  });

  it("should exclude a provided shared entity", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const shoppingList = await generateShoppingList({ user_id: user.id });
    const thirdMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });
    await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: thirdMembership.id,
    });

    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        entity_filter: "exclude",
        entity_id: shoppingList.id,
        entity_type: "shopping_list",
        page_number: 0,
        from_self: true,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(1);
    expect(responseData[0].id).toBe(membership.id);
  });

  it("should include only a provided shared entity", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const shoppingList = await generateShoppingList({
      user_id: user.id,
    });
    await generateShoppingListShare({
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
    });

    // make some noise!
    await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server)
      .get("/user-kitchen-membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        entity_filter: "include",
        entity_id: shoppingList.id,
        entity_type: "shopping_list",
        from_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(1);
    expect(responseData[0].id).toBe(membership.id);
  });
});
