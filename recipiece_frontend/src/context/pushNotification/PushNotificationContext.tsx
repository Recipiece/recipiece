import { YCreatePushNotificationRequestSubscriptionDataSchema } from "@recipiece/types";
import { AxiosError } from "axios";
import { createContext, FC, PropsWithChildren, useCallback, useEffect } from "react";
import { v4 } from "uuid";
import { TokenManager, useOptIntoPushNotificationsMutation } from "../../api";
import { StorageKeys } from "../../util";

const generateServiceWorkerPushNotificationSubscription = async () => {
  if (process.env.NODE_ENV !== "development") {
    const applicationServerKey = urlB64ToUint8Array(process.env.RECIPIECE_VAPID_PUBLIC_KEY!);
    const options = { applicationServerKey, userVisibleOnly: true };
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.subscribe(options);
  } else {
    return Promise.resolve(undefined);
  }
};

const urlB64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
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
  const pushNotificationDeviceId = localStorage.getItem(StorageKeys.PUSH_NOTIFICATION_DEVICE_ID)
    ? JSON.parse(localStorage.getItem(StorageKeys.PUSH_NOTIFICATION_DEVICE_ID)!)
    : undefined;
  const { mutateAsync: optIntoPushNotifications } = useOptIntoPushNotificationsMutation();
  const tokenManager = TokenManager.getInstance();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promiseQueue: Promise<any>[] = [];

  const requestAndSaveNotificationPermissions = useCallback(
    async (evenWhenDenied = false) => {
      let deviceId = pushNotificationDeviceId ?? v4();
      let grantResult = "unknown";
      try {
        grantResult = await lazyRequestNotificationsPermissions(evenWhenDenied);
        if (grantResult === "granted") {
          const subscription = await generateServiceWorkerPushNotificationSubscription();
          if (subscription) {
            await optIntoPushNotifications({
              device_id: deviceId,
              subscription_data: YCreatePushNotificationRequestSubscriptionDataSchema.cast(subscription.toJSON()),
            })
              .catch((err: AxiosError) => {
                if (err.status === 410) {
                  deviceId = v4();
                  return optIntoPushNotifications({
                    device_id: deviceId,
                    subscription_data: YCreatePushNotificationRequestSubscriptionDataSchema.cast(subscription.toJSON()),
                  });
                }
              })
              .then(() => {
                localStorage.setItem(StorageKeys.PUSH_NOTIFICATION_DEVICE_ID, deviceId);
              })
              .catch(() => {
                // nothing we can do here :(
              });
          }
        }
      } catch (err) {
        console.log(err);
      }
      localStorage.setItem(StorageKeys.PUSH_NOTIFICATION_DEVICE_ID, JSON.stringify(deviceId));
      return grantResult;
    },
    [optIntoPushNotifications, pushNotificationDeviceId]
  );

  const initialize = useCallback(async () => {
    let deviceId = pushNotificationDeviceId ?? v4();
    if ("Notification" in window) {
      const hasBeenGranted = Notification.permission === "granted";
      if (hasBeenGranted) {
        // go ahead and create a new subscription for this device id
        const subscription = await generateServiceWorkerPushNotificationSubscription();
        if (subscription) {
          await optIntoPushNotifications({
            device_id: deviceId,
            subscription_data: YCreatePushNotificationRequestSubscriptionDataSchema.cast(subscription.toJSON()),
          })
            .catch((err: AxiosError) => {
              if (err.status === 410) {
                deviceId = v4();
                return optIntoPushNotifications({
                  device_id: deviceId,
                  subscription_data: YCreatePushNotificationRequestSubscriptionDataSchema.cast(subscription.toJSON()),
                });
              }
            })
            .then(() => {
              localStorage.setItem(StorageKeys.PUSH_NOTIFICATION_DEVICE_ID, deviceId);
            })
            .catch(() => {
              // nothing we can do here :(
            });
        }
      }
      localStorage.setItem(StorageKeys.PUSH_NOTIFICATION_DEVICE_ID, JSON.stringify(deviceId));
    }
  }, [pushNotificationDeviceId, optIntoPushNotifications]);

  /**
   * When we load in, create a push notification subscription
   */
  useEffect(() => {
    if (tokenManager.isLoggedIn && promiseQueue.length === 0) {
      promiseQueue.push(initialize());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenManager.isLoggedIn]);

  return (
    <PushNotificationContext.Provider value={{ requestAndSaveNotificationPermissions }}>
      {children}
    </PushNotificationContext.Provider>
  );
};
