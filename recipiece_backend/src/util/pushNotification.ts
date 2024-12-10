import { Timer, UserPushNotificationSubscription } from "@prisma/client";
import webpush, { PushSubscription, WebPushError } from "web-push";
import { prisma } from "../database";

if (process.env.APP_ENABLE_PUSH_NOTIFICATIONS === "Y") {
  const { APP_EMAIL_ADDRESS, APP_VAPID_PUBLIC_KEY, APP_VAPID_PRIVATE_KEY } = process.env;
  webpush.setVapidDetails(`mailto:${APP_EMAIL_ADDRESS}`, APP_VAPID_PUBLIC_KEY!, APP_VAPID_PRIVATE_KEY!);
}

const sendPushNotification = async (subscription: UserPushNotificationSubscription, payload: any) => {
  try {
    if (process.env.APP_ENABLE_PUSH_NOTIFICATIONS === "Y") {
      return webpush.sendNotification(
        subscription.subscription_data as unknown as PushSubscription,
        JSON.stringify(payload)
      );
    } else {
      console.log(
        `APP_ENABLE_PUSH_NOTIFICATIONS is set to ${process.env.APP_ENABLE_PUSH_NOTIFICATIONS}, not sending push notification`
      );
      console.log("would have sent");
      console.log(payload);
      console.log(`to subscription ${subscription.subscription_data}`);
      return Promise.resolve();
    }
  } catch (err) {
    // if for some reason we failed to send the push notification, kill the subscription
    console.error(err);
    if (err instanceof WebPushError) {
      console.log(`failed to send push notification to subscription ${subscription.id}, removing it`);
      await prisma.userPushNotificationSubscription.delete({
        where: {
          id: subscription.id,
        },
      });
    }
  }
};

export const sendTimerFinishedPushNotification = async (
  subscription: UserPushNotificationSubscription,
  timer: Timer
) => {
  const message = {
    title: "Time's Up!",
    body: "Your timer is done!",
    type: "timer",
    data: { ...timer },
    requiresInteraction: true,
    tag: `timer${timer.id}`,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
  };
  await sendPushNotification(subscription, message);
  console.log("SENT NOTIF");
};
