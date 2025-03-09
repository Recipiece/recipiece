import { ListCookbookSharesQuerySchema, ListCookbooksQuerySchema } from "@recipiece/types";
import { RcpQueryKey } from "../QueryKeys";

export class CookbookQueryKeys {
  public static readonly GET_COOKBOOK = (id?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["cookbook"];

    if (id) {
      base.push({ id });
    }

    return base;
  };

  public static readonly LIST_COOKBOOKS = (filters?: Partial<ListCookbooksQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listCookbooks"];
    if (filters) {
      const { page_number, search, recipe_id, recipe_id_filter } = filters;

      if (page_number) {
        base.push({
          page_number,
        });
      }

      if (recipe_id) {
        base.push({
          recipe_id,
        });
      }

      if (recipe_id_filter) {
        base.push({
          recipe_id_filter,
        });
      }

      if (search) {
        base.push({
          search,
        });
      }
    }

    return base;
  };

  public static readonly LIST_COOKBOOK_SHARES = (filters?: Partial<ListCookbookSharesQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listCookbookShares"];

    const { targeting_self, from_self, page_number, user_kitchen_membership_id } = filters ?? {};
    if (targeting_self !== undefined) {
      base.push({ targeting_self });
    }
    if (from_self !== undefined) {
      base.push({ from_self });
    }
    if (page_number !== undefined) {
      base.push({ page_number });
    }
    if (user_kitchen_membership_id) {
      base.push({ user_kitchen_membership_id });
    }
    return base;
  };

  public static readonly GET_COOKBOOK_SHARE = (id?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["cookbookShare"];

    if (id) {
      base.push({ id });
    }

    return base;
  };
}
