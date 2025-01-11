import { ListCookbookFilters } from "../../data";
import { RcpQueryKey } from "../QueryKeys";

export class CookbookQueryKeys {
  public static readonly GET_COOKBOOK = (cookbookId: number): RcpQueryKey => {
    return ["cookbook", { id: cookbookId }];
  };

  public static readonly LIST_COOKBOOK = (filters?: Partial<ListCookbookFilters>): RcpQueryKey => {
    const base: RcpQueryKey = ["listCookbook"];
    if (filters) {
      const { page_number, search, exclude_containing_recipe_id } = filters;

      if (page_number) {
        base.push({
          page_number,
        });
      }

      if (exclude_containing_recipe_id) {
        base.push({
          exclude_containing_recipe_id,
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
}
