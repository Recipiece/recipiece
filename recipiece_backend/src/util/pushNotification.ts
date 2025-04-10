import { MealPlan, prisma, ShoppingList, User, UserPushNotificationSubscription } from "@recipiece/database";
import webpush, { PushSubscription, WebPushError } from "web-push";
import { Environment } from "./environment";

if (Environment.ENABLE_PUSH_NOTIFICATIONS && Environment.VAPID_PUBLIC_KEY && Environment.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(`mailto:${Environment.EMAIL_ADDRESS}`, Environment.VAPID_PUBLIC_KEY, Environment.VAPID_PRIVATE_KEY);
}

export const sendPushNotification = async (subscription: UserPushNotificationSubscription, payload: any) => {
  try {
    if (Environment.ENABLE_PUSH_NOTIFICATIONS) {
      await webpush.sendNotification(subscription.subscription_data as unknown as PushSubscription, JSON.stringify(payload));
      return Promise.resolve();
    } else {
      console.log(`environment ENABLE_PUSH_NOTIFICATIONS is set to ${Environment.ENABLE_PUSH_NOTIFICATIONS}, not sending push notification`);
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

export const sendShoppingListSharedPushNotification = async (subscription: UserPushNotificationSubscription, sourceUser: User, shoppingList: ShoppingList) => {
  const message = {
    title: "Shopping List Shared",
    body: `${sourceUser.username} shared their shopping list ${shoppingList.name} with you`,
    type: "shoppingListShare",
    data: { ...shoppingList },
    requiresInteraction: true,
    tag: `shoppingListShare${shoppingList.id}`,
  };
  await sendPushNotification(subscription, message);
};

export const sendMealPlanSharedPushNotification = async (subscription: UserPushNotificationSubscription, sourceUser: User, mealPlan: MealPlan) => {
  const message = {
    title: "Meal Plan Shared",
    body: `${sourceUser.username} shared their meal plan ${mealPlan.name} with you`,
    type: "mealPlanShare",
    data: { ...mealPlan },
    requiresInteraction: true,
    tag: `mealPlanShare${mealPlan.id}`,
  };
  await sendPushNotification(subscription, message);
};
