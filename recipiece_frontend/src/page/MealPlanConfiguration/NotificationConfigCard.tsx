import { FC, useContext, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardTitle, FormSwitch, Label, PreferenceEntry } from "../../component";
import { PushNotificationContext } from "../../context";

export const NotificationConfigCard: FC = () => {
  const { requestAndSaveNotificationPermissions } = useContext(PushNotificationContext);
  const form = useFormContext();
  const meatNotification = form.watch("meats.send_thawing_notification");

  useEffect(() => {
    if (meatNotification === true) {
      if (canRequestPushNotificationPermissions && !hasGrantedPushNotifications && !hasDeniedPushNotifications) {
        requestAndSaveNotificationPermissions()
          .then((status) => {
            if (status !== "granted") {
              form.setValue("meats.send_thawing_notification", false);
            }
          })
          .catch(() => {
            form.setValue("meats.send_thawing_notification", false);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meatNotification]);

  const canRequestPushNotificationPermissions = "Notification" in window;
  const hasGrantedPushNotifications = window.Notification?.permission === "granted";
  const hasDeniedPushNotifications = window.Notification?.permission === "denied";

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure notification settings for your meal plan. Push notifications will only be sent to devices where you have granted notification permissions in your{" "}
          <a href="/account" className="underline">
            settings
          </a>
          .
        </CardDescription>
        <CardContent>
          <div className="flex flex-col gap-2">
            <PreferenceEntry>
              <>
                <Label>Meal Notifications</Label>
                <p className="text-xs">Send notifications for starting meals.</p>
              </>

              <FormSwitch disabled={!canRequestPushNotificationPermissions || hasDeniedPushNotifications} name="general.send_recipe_notification" />
            </PreferenceEntry>

            <PreferenceEntry>
              <>
                <Label>Thawing Notifications</Label>
                <p className="text-xs">Send notifications for beginning the thawing process for meat ingredients.</p>
              </>

              <FormSwitch name="meats.send_thawing_notification" disabled={!canRequestPushNotificationPermissions || hasDeniedPushNotifications} />
            </PreferenceEntry>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
