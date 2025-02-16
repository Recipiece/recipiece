import { faker } from "@faker-js/faker";
import { Notification, prisma, PrismaTransaction, UserKitchenMembershipNotificationAttachment } from "@recipiece/database";
import { generateUser, generateUserKitchenMembership } from "./user";

export const generateNotification = async (notification?: Partial<Omit<Notification, "id">>, tx?: PrismaTransaction) => {
  const userId = notification?.user_id ?? (await generateUser(undefined, tx)).id;
  const type = notification?.type ?? faker.helpers.arrayElement(["mealPlanMeatTimer"]);
  const status = notification?.status ?? faker.helpers.arrayElement(["read", "unread"]);

  let readByUserId = notification?.read_by_user_id;
  let readAt = notification?.read_at;

  if (status === "read") {
    if (readByUserId === undefined) {
      const readByOwner = faker.number.int({ min: 0, max: 1 }) % 2 === 0;
      if (readByOwner) {
        readByUserId = userId;
      } else {
        readByUserId = (await generateUser(undefined, tx)).id;
      }
    }

    if (!readAt === undefined) {
      readAt = new Date();
    }
  }

  return (tx ?? prisma).notification.create({
    data: {
      created_at: notification?.created_at,
      user_id: userId,
      type: type,
      status: status,
      content: notification?.content ?? faker.word.words({ count: { min: 2, max: 15 } }),
      read_by_user_id: readByUserId,
      read_at: readAt,
      title: notification?.title ?? faker.word.words({ count: { min: 2, max: 5 } }),
    },
  });
};

export const generateUserKitchenMembershipNotificationAttachment = async (attachment?: Partial<UserKitchenMembershipNotificationAttachment>, tx?: PrismaTransaction) => {
  let notification = undefined;
  if (attachment?.notification_id) {
    notification = await (tx ?? prisma).notification.findFirst({
      where: {
        id: attachment.notification_id,
      },
    });
  }

  if (!notification) {
    notification = await generateNotification(undefined, tx);
  }

  let userKitchenMembership = undefined;
  if (attachment?.user_kitchen_membership_id) {
    userKitchenMembership = await (tx ?? prisma).userKitchenMembership.findFirst({
      where: {
        id: attachment?.user_kitchen_membership_id,
      },
    });
  }

  if (!userKitchenMembership) {
    userKitchenMembership = await generateUserKitchenMembership({ source_user_id: notification.user_id }, tx);
  }

  return (tx ?? prisma).userKitchenMembershipNotificationAttachment.create({
    data: {
      user_kitchen_membership_id: userKitchenMembership.id,
      notification_id: notification.id,
      created_at: attachment?.created_at,
    },
  });
};
