import { prisma, User } from "@recipiece/database";
import {
  generateNotification,
  generateUserKitchenMembership,
  generateUserKitchenMembershipNotificationAttachment,
} from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Notification", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should delete a notification you own", async () => {
    const notification = await generateNotification({ user_id: user.id, read_by_user_id: null });
    const response = await request(server)
      .delete(`/notification/${notification.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedRecord = await prisma.notification.findFirst({
      where: {
        id: notification.id,
      },
    });

    expect(deletedRecord).toBeFalsy();
  });

  it("should delete a notification that is attached to an accepted user kitchen membership targeting you", async () => {
    const notification = await generateNotification({
      read_by_user_id: null,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: notification.user_id,
      destination_user_id: user.id,
      status: "accepted",
    });
    await generateUserKitchenMembershipNotificationAttachment({
      user_kitchen_membership_id: membership.id,
      notification_id: notification.id,
    });

    const response = await request(server)
      .delete(`/notification/${notification.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedRecord = await prisma.notification.findFirst({
      where: {
        id: notification.id,
      },
    });

    expect(deletedRecord).toBeFalsy();
  });

  it("should not delete a notification that is attached to a non-accepted user kitchen membership targeting you", async () => {
    const notification = await generateNotification({ read_by_user_id: null });
    const membership = await generateUserKitchenMembership({
      source_user_id: notification.user_id,
      destination_user_id: user.id,
      status: "denied",
    });
    await generateUserKitchenMembershipNotificationAttachment({
      user_kitchen_membership_id: membership.id,
      notification_id: notification.id,
    });

    const response = await request(server)
      .delete(`/notification/${notification.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const deletedRecord = await prisma.notification.findFirst({
      where: {
        id: notification.id,
      },
    });

    expect(deletedRecord).toBeTruthy();
  });

  it("should not delete a notification that you do not own", async () => {
    const notification = await generateNotification({ read_by_user_id: null });
    const response = await request(server)
      .delete(`/notification/${notification.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const deletedRecord = await prisma.notification.findFirst({
      where: {
        id: notification.id,
      },
    });

    expect(deletedRecord).toBeTruthy();
  });
});
