import { User, prisma } from "@recipiece/database";
import { generateCookbook, generateUserKitchenMembership } from "@recipiece/test";
import { CookbookShareSchema, CreateCookbookShareRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Cookbook Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it("should allow a user to share a cookbook from one user to another", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const cookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server)
      .post("/cookbook/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateCookbookShareRequestSchema>{
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const bodyShare = response.body as CookbookShareSchema;
    expect(bodyShare.cookbook_id).toBe(cookbook.id);
    expect(bodyShare.user_kitchen_membership_id).toBe(membership.id);

    const createdShare = await prisma.cookbookShare.findFirst({
      where: {
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeTruthy();
  });

  it("should not allow a duplicate share", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const cookbook = await generateCookbook({ user_id: user.id });

    await prisma.cookbookShare.create({
      data: {
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: membership.id,
      },
    });

    const response = await request(server)
      .post("/cookbook/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateCookbookShareRequestSchema>{
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });

  it("should not allow a share to a kitchen membership that is not accepted", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "pending",
    });
    const cookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server)
      .post("/cookbook/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateCookbookShareRequestSchema>{
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.cookbookShare.findFirst({
      where: {
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a kitchen membership that does not exist", async () => {
    const cookbook = await generateCookbook({ user_id: user.id });

    const response = await request(server)
      .post("/cookbook/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateCookbookShareRequestSchema>{
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: 100000,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.cookbookShare.findFirst({
      where: {
        cookbook_id: cookbook.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a cookbook that does not exist", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "pending",
    });

    const response = await request(server)
      .post("/cookbook/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateCookbookShareRequestSchema>{
        cookbook_id: 1000000,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.cookbookShare.findFirst({
      where: {
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });

  it("should not allow a share to a cookbook that the requesting user does not own", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "pending",
    });
    const cookbook = await generateCookbook();

    const response = await request(server)
      .post("/cookbook/share")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<CreateCookbookShareRequestSchema>{
        cookbook_id: cookbook.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    const createdShare = await prisma.cookbookShare.findFirst({
      where: {
        user_kitchen_membership_id: membership.id,
      },
    });
    expect(createdShare).toBeFalsy();
  });
});
