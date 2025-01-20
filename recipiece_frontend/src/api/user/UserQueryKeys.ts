import { ListUserKitchenMembershipsQuerySchema } from "@recipiece/types";
import { RcpQueryKey } from "../QueryKeys";

export class UserQueryKeys {
  public static readonly CURRENT_USER = "currentUser";

  public static LIST_USER_KITCHEN_MEMBERSHIPS = (filters?: Partial<ListUserKitchenMembershipsQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listKitchenMemberships"];
    const { from_self, targeting_self, page_number, status, entity, entity_id, entity_type } = filters ?? {};

    if (entity) {
      base.push({ entity });
    }
    if (entity_id) {
      base.push({ entity_id });
    }
    if (entity_type) {
      base.push({ entity_type });
    }
    if (from_self) {
      base.push({ from_self });
    }
    if (targeting_self) {
      base.push({ targeting_self });
    }
    if (status) {
      base.push({ status });
    }
    if (page_number) {
      base.push({ page_number });
    }

    return base;
  };

  public static GET_USER_KITCHEN_MEMBERSHIP = (id: number): RcpQueryKey => {
    return ["getKitchenMembership", { id }];
  };
}
