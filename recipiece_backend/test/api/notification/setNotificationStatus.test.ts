import { User } from "@recipiece/database";
import { generateNotification } from "@recipiece/test";
import { SetNotificationStatusRequestSchema, YNotificationSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Set Notification Status", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should set the notification status of a notification you own", async () => {
    const notification = await generateNotification({
      user_id: user.id,
      read_by_user_id: null,
      read_at: null,
    });

    const response = await request(server)
      .put("/notification/status")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<SetNotificationStatusRequestSchema>{
        id: notification.id,
        status: "read",
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseNotification = YNotificationSchema.cast(response.body);
    expect(responseNotification.status).toBe("read");
    expect(responseNotification.read_by_user_id).toBe(user.id);
    const now = new Date();
    expect(Math.abs(now.getUTCMilliseconds() - responseNotification.read_at!.getUTCMilliseconds())).toBeLessThan(2000);
  });

  it("should remove the read_at and read_by when moving a notification to unread", async () => {});

  it("should set the notification status of a notification attached to an accepted user kitchen targeting you", async () => {});

  it("should not set the status of a notification you do not own", async () => {});

  it("should not set the notification status of a notification attached to a non-accepted user kitchen membership", async () => {});

  it("should mark which user read the notification and when they read it when the status is being set to read", async () => {});
});
