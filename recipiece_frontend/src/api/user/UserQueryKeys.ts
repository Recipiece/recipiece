import { ListUserKitchenMembershipFilters } from "../../data";

export class UserQueryKeys {
  public static readonly CURRENT_USER = "currentUser";

  public static LIST_KITCHEN_MEMBERSHIPS = (filters?: Partial<ListUserKitchenMembershipFilters>) => {
    const base: any[] = ["listKitchenMemberships"];
    const { from_self, targeting_self, page_number, status } = filters ?? {};

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

  public static GET_KITCHEN_MEMBERSHIP = (id: number) => {
    return ["getKitchenMembership", { id }];
  };
}
