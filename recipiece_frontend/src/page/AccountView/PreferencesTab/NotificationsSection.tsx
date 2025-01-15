import { FC, useCallback, useContext } from "react";
import { H3, Label, Switch } from "../../../component";
import { PushNotificationContext } from "../../../context";

export const NotificationsSection: FC = () => {
  const { requestAndSaveNotificationPermissions } = useContext(PushNotificationContext);

  const canRequestPushNotifications = "Notification" in window;
  const hasGrantedPushNotifications = canRequestPushNotifications && window.Notification.permission === "granted";

  const onChangePushNotifications = useCallback(async () => {
    await requestAndSaveNotificationPermissions();
  }, [requestAndSaveNotificationPermissions]);

  return (
    <>
      <H3>Notifications</H3>
      <div className="flex flex-row">
        <div className="basis-9/12 sm:basis-1/2 flex-col">
          <Label>Allow Push Notifications on this Device</Label>
          {hasGrantedPushNotifications && (
            <p className="text-xs">You have already granted push notifications on this device. To disable push notifications, look in your system settings.</p>
          )}
        </div>
        <div className="ml-auto sm:ml-0">
          <Switch checked={hasGrantedPushNotifications} onCheckedChange={onChangePushNotifications} disabled={canRequestPushNotifications || hasGrantedPushNotifications} />
        </div>
      </div>
    </>
  );
};
