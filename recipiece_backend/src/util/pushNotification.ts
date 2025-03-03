import { Cookbook, MealPlan, prisma, Recipe, ShoppingList, User, UserPushNotificationSubscription } from "@recipiece/database";
import webpush, { PushSubscription, WebPushError } from "web-push";

if (process.env.APP_ENABLE_PUSH_NOTIFICATIONS === "Y") {
  const { APP_EMAIL_ADDRESS, APP_VAPID_PUBLIC_KEY, APP_VAPID_PRIVATE_KEY } = process.env;
  webpush.setVapidDetails(`mailto:${APP_EMAIL_ADDRESS}`, APP_VAPID_PUBLIC_KEY!, APP_VAPID_PRIVATE_KEY!);
}

export const sendPushNotification = async (subscription: UserPushNotificationSubscription, payload: any) => {
  try {
    if (process.env.APP_ENABLE_PUSH_NOTIFICATIONS === "Y") {
      await webpush.sendNotification(subscription.subscription_data as unknown as PushSubscription, JSON.stringify(payload));
      return Promise.resolve();
    } else {
      console.log(`APP_ENABLE_PUSH_NOTIFICATIONS is set to ${process.env.APP_ENABLE_PUSH_NOTIFICATIONS}, not sending push notification`);
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

export const sendCookbookSharedPushNotification = async (subscription: UserPushNotificationSubscription, sourceUser: User, cookbook: Cookbook) => {
  const message = {
    title: "Cookbook Shared",
    body: `${sourceUser.username} shared their cookbook ${cookbook.name} with you`,
    type: "cookbookShare",
    data: { ...cookbook },
    requiresInteraction: true,
    tag: `cookbookShare${cookbook.id}`,
  };
  await sendPushNotification(subscription, message);
};

export const sendRecipeSharedPushNotification = async (subscription: UserPushNotificationSubscription, sourceUser: User, recipe: Recipe) => {
  const message = {
    title: "Recipe Shared",
    body: `${sourceUser.username} shared their recipe ${recipe.name} with you`,
    type: "recipeShare",
    data: { ...recipe },
    requiresInteraction: true,
    tag: `recipeShare${recipe.id}`,
  };
  await sendPushNotification(subscription, message);
};
