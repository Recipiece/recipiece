import { User } from "@prisma/client";
import request from "supertest";
import { prisma } from "../../../src/database";
import { UserKitchenInvitationStatus } from "../../../src/util/constant";
import {
  ListUserKitchenMembershipsQuerySchema,
  ListUserKitchenMembershipsResponseSchema,
  UserKitchenMembershipSchema,
} from "../../../src/schema";
import { StatusCodes } from "http-status-codes";

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
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: user.id,
          destination_user_id: tmpUser.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    for (let i = 0; i < 10; i++) {
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: tmpUser.id,
          destination_user_id: user.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    const response = await request(server)
      .get("/user/kitchen/membership/list")
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
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: user.id,
          destination_user_id: tmpUser.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    for (let i = 0; i < 10; i++) {
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: tmpUser.id,
          destination_user_id: user.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    const response = await request(server)
      .get("/user/kitchen/membership/list")
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
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: user.id,
          destination_user_id: tmpUser.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    for (let i = 0; i < 10; i++) {
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: tmpUser.id,
          destination_user_id: user.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    const response = await request(server)
      .get("/user/kitchen/membership/list")
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
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: user.id,
          destination_user_id: tmpUser.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    for (let i = 0; i < UserKitchenInvitationStatus.ALL_STATUSES.length * 4; i++) {
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: tmpUser.id,
          destination_user_id: user.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    const totalNumMemberships = UserKitchenInvitationStatus.ALL_STATUSES.length * 4 * 2;

    const response = await request(server)
      .get("/user/kitchen/membership/list")
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
      .get("/user/kitchen/membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should page", async () => {
    for (let i = 0; i < 10; i++) {
      const [tmpUser] = await fixtures.createUserAndToken();
      await prisma.userKitchenMembership.create({
        data: {
          source_user_id: user.id,
          destination_user_id: tmpUser.id,
          status: UserKitchenInvitationStatus.ALL_STATUSES[i % UserKitchenInvitationStatus.ALL_STATUSES.length],
        },
      });
    }

    const response = await request(server)
      .get("/user/kitchen/membership/list")
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
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "accepted",
      },
    });

    const recipe = await prisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      },
    });

    const recipeShare = await prisma.recipeShare.create({
      data: {
        user_kitchen_membership_id: membership.id,
        recipe_id: recipe.id,
      },
    });

    const [thirdUser] = await fixtures.createUserAndToken();
    const thirdMembership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: thirdUser.id,
        status: "accepted",
      },
    });

    const response = await request(server)
      .get("/user/kitchen/membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        entity: "exclude",
        entity_id: recipe.id,
        entity_type: "recipe",
        page_number: 0,
        from_self: true,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData = (response.body as ListUserKitchenMembershipsResponseSchema).data;
    expect(responseData.length).toBe(1);
    expect(responseData[0].id).toBe(thirdMembership.id);
  });

  it("should include only a provided shared entity", async () => {
    const membership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: "accepted",
      },
    });

    const recipe = await prisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      },
    });

    const recipeShare = await prisma.recipeShare.create({
      data: {
        user_kitchen_membership_id: membership.id,
        recipe_id: recipe.id,
      },
    });

    const [thirdUser] = await fixtures.createUserAndToken();
    const thirdMembership = await prisma.userKitchenMembership.create({
      data: {
        source_user_id: user.id,
        destination_user_id: thirdUser.id,
        status: "accepted",
      },
    });

    const response = await request(server)
      .get("/user/kitchen/membership/list")
      .query(<ListUserKitchenMembershipsQuerySchema>{
        entity: "include",
        entity_id: recipe.id,
        entity_type: "recipe",
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
