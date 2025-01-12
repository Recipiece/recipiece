import { Job } from "bullmq";
import { prisma } from "../database";
import { sendTimerFinishedPushNotification } from "../util/pushNotification";

export const processTimer = async (job: Job) => {
  const pushNotificationSubscriptions = await prisma.userPushNotificationSubscription.findMany({
    where: {
      user_id: job.data.user_id,
    },
  });

  if (pushNotificationSubscriptions.length > 0) {
    pushNotificationSubscriptions.forEach(async (subscription) => {
      try {
        await sendTimerFinishedPushNotification(subscription, job.data);
      } catch (err) {
        console.log("error sending push notifications, skipping subscription.");
        console.error(err);
      }
    });
  } else {
    console.log(`no push notification subscriptions found for user ${job.data.user_id}`);
  }
};
