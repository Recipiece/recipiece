import {
  YListNotificationsQuerySchema,
  YListNotificationsResponseSchema,
  YNotificationSchema,
  YSetNotificationStatusRequestSchema,
} from "@recipiece/types";
import { Route } from "../../types";
import { deleteNotification } from "./deleteNotification";
import { getNotification } from "./getNotification";
import { listNotifications } from "./listNotifications";
import { setNotificationStatus } from "./setNotificationStatus";

export const NOTIFICATION_ROUTES: Route[] = [
  {
    path: "/notification/list",
    method: "GET",
    requestSchema: YListNotificationsQuerySchema,
    responseSchema: YListNotificationsResponseSchema,
    authentication: "access_token",
    function: listNotifications,
  },
  {
    path: "/notification/:id",
    method: "GET",
    responseSchema: YNotificationSchema,
    authentication: "access_token",
    function: getNotification,
  },
  {
    path: "/notification/status",
    method: "PUT",
    requestSchema: YSetNotificationStatusRequestSchema,
    responseSchema: YNotificationSchema,
    authentication: "access_token",
    function: setNotificationStatus,
  },
  {
    path: "/notification/:id",
    method: "DELETE",
    authentication: "access_token",
    function: deleteNotification,
  },
];
