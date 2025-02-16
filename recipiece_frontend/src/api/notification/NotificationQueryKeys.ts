import { ListNotificationsQuerySchema } from "@recipiece/types";
import { RcpQueryKey } from "../QueryKeys";

export class NotificationQueryKeys {
  public static readonly GET_NOTIFICATION = (id?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["getNotification"];
    if (id) {
      base.push({ id });
    }
    return base;
  };

  public static readonly LIST_NOTIFICATIONS = (filters?: Partial<ListNotificationsQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listNotifications"];
    const { page_size, page_number } = filters ?? {};
    if (page_number) {
      base.push({ page_number });
    }
    if (page_size) {
      base.push({ page_size });
    }

    return base;
  };
}
