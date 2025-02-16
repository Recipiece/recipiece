import { User } from "@recipiece/database";
import { generateNotification, generateUserKitchenMembership, generateUserKitchenMembershipNotificationAttachment } from "@recipiece/test";
import { NotificationSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Get Notification", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should get a notification that the user owns", async () => {
    const notification = await generateNotification({ user_id: user.id, read_by_user_id: null });
    const response = await request(server).get(`/notification/${notification.id}`).set("Authorization", `Bearer ${bearerToken}`).send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const returnedNotification = response.body as NotificationSchema;
    expect(returnedNotification.id).toBe(notification.id);
  });

  it("should get a notification attached to an accepted shared user kitchen membership", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const notification = await generateNotification({
      user_id: user.id,
      read_at: null,
      read_by_user_id: null,
    });
    await generateUserKitchenMembershipNotificationAttachment({
      user_kitchen_membership_id: membership.id,
      notification_id: notification.id,
    });

    const response = await request(server)
      .get(`/notification/${notification.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const returnedNotification = response.body as NotificationSchema;
    expect(returnedNotification.id).toBe(notification.id);

  });

  it("should not get a notification attached to a non-accepted user kitchen membership", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "denied",
    });
    const notification = await generateNotification({
      user_id: user.id,
      read_at: null,
      read_by_user_id: null,
    });
    await generateUserKitchenMembershipNotificationAttachment({
      user_kitchen_membership_id: membership.id,
      notification_id: notification.id,
    });

    const response = await request(server)
      .get(`/notification/${notification.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not get a notification that you do not own and is not shared to you", async () => {
    const [_, otherBearerToken] = await fixtures.createUserAndToken();
    const notification = await generateNotification({
      user_id: user.id,
      read_at: null,
      read_by_user_id: null,
    });

    const response = await request(server)
      .get(`/notification/${notification.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
