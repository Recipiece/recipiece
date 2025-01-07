import { createContext, FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";
import { TokenManager, useOptIntoPushNotificationsMutation } from "../../api";
import { useLocalStorage } from "../../hooks";
import { StorageKeys } from "../../util";

const generateServiceWorkerPushNotificationSubscription = async () => {
  const applicationServerKey = urlB64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY!);
  const options = { applicationServerKey, userVisibleOnly: true };
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.subscribe(options);
};

const urlB64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const lazyRequestNotificationsPermissions = async (evenWhenDenied = false) => {
  return new Promise<"granted" | "denied" | "nothing">((resolve, reject) => {
    if ("Notification" in window) {
      const hasBeenExplicitlyDenied = Notification.permission === "denied";
      const hasBeenGranted = Notification.permission === "granted";
      if (hasBeenGranted) {
        resolve("nothing");
      } else {
        // show the message if the user has not explicitly denied the permission before,
        // or, if we want to pester them (jk) then show it anyways
        if (!hasBeenExplicitlyDenied || evenWhenDenied) {
          Notification.requestPermission()
            .then((permission) => {
              if (permission === "granted") {
                resolve("granted");
              } else {
                resolve("denied");
              }
            })
            .catch(() => {
              reject();
            });
        } else {
          resolve("nothing");
        }
      }
    } else {
      // nothing to do here, just keep on trucking
      reject();
    }
  });
};

export const PushNotificationContext = createContext({
  requestAndSaveNotificationPermissions: () => Promise.resolve("unknown"),
});

export const PushNotificationContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [pushNotificationDeviceId, setPushNotificationDeviceId] = useLocalStorage<string | undefined>(StorageKeys.PUSH_NOTIFICATION_DEVICE_ID, undefined);
  const { mutateAsync: optIntoPushNotifications } = useOptIntoPushNotificationsMutation();
  const tokenManager = TokenManager.getInstance();
  const promiseQueue: Promise<any>[] = [];

  const requestAndSaveNotificationPermissions = useCallback(
    async (evenWhenDenied = false) => {
      const deviceId = pushNotificationDeviceId ?? v4();
      let grantResult = "unknown";
      try {
        grantResult = await lazyRequestNotificationsPermissions(evenWhenDenied);
        if (grantResult === "granted") {
          const subscription = await generateServiceWorkerPushNotificationSubscription();
          await optIntoPushNotifications({
            device_id: deviceId,
            subscription_data: subscription.toJSON(),
          });
        }
      } catch {
        // noop
      }
      setPushNotificationDeviceId(deviceId);
      return grantResult;
    },
    [optIntoPushNotifications, pushNotificationDeviceId, setPushNotificationDeviceId]
  );

  const initialize = useCallback(async () => {
    const deviceId = pushNotificationDeviceId ?? v4();
    if ("Notification" in window) {
      const hasBeenGranted = Notification.permission === "granted";
      if (hasBeenGranted) {
        // go ahead and create a new subscription for this device id
        const subscription = await generateServiceWorkerPushNotificationSubscription();
        try {
         await optIntoPushNotifications({
            device_id: deviceId,
            subscription_data: subscription.toJSON(),
          });
        } catch {
          // noop
        }
      }
      setPushNotificationDeviceId(deviceId);
    }
  }, [pushNotificationDeviceId, setPushNotificationDeviceId, optIntoPushNotifications]);

  /**
   * When we load in, create a push notification subscription
   */
  useEffect(() => {
    if (tokenManager.isLoggedIn && promiseQueue.length === 0) {
      promiseQueue.push(initialize());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenManager.isLoggedIn]);

  return <PushNotificationContext.Provider value={{ requestAndSaveNotificationPermissions }}>{children}</PushNotificationContext.Provider>;
};
