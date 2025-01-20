import { ListRecipeSharesQuerySchema, ListRecipesQuerySchema } from "@recipiece/types";
import { RcpQueryKey } from "../QueryKeys";

export class RecipeQueryKeys {
  public static readonly GET_RECIPE = (recipeId?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["recipe"];

    if (recipeId) {
      base.push({ id: recipeId });
    }

    return base;
  };

  public static readonly LIST_RECIPES = (filters?: Partial<ListRecipesQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listRecipes"];
    if (filters) {
      const { page_number, cookbook_id, search, cookbook_attachments, shared_recipes } = filters;
      if (page_number) {
        base.push({ page_number });
      }

      if (cookbook_id) {
        base.push({ cookbook_id });
      }

      if (cookbook_attachments) {
        base.push({ cookbook_attachments });
      }

      if (shared_recipes) {
        base.push({ shared_recipes });
      }

      if (search) {
        base.push({ search });
      }
    }

    return base;
  };

  public static readonly LIST_RECIPES_FOR_MEAL_PLAN = (filters?: Partial<ListRecipesQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["recipeMealPlanSearch"];
    if (filters) {
      const { page_number, cookbook_id, search } = filters;
      if (page_number) {
        base.push({ page_number });
      }

      if (cookbook_id) {
        base.push({ cookbook_id });
      }

      if (search) {
        base.push({ search });
      }
    }

    return base;
  };

  public static readonly LIST_RECIPES_AVAILABLE_TO_COOKBOOK = (filters?: Partial<{ readonly search: string; readonly cookbook_id: number }>): RcpQueryKey => {
    const base: RcpQueryKey = ["recipeCookbookSearch"];
    if (filters) {
      const { search, cookbook_id } = filters;
      if (search) {
        base.push({ search });
      }
      if (cookbook_id) {
        base.push({ cookbook_id });
      }
    }
    return base;
  };

  public static readonly LIST_RECIPE_SHARES = (filters?: Partial<ListRecipeSharesQuerySchema>): RcpQueryKey => {
    const base: RcpQueryKey = ["listRecipeShares"];
    const { page_number, user_kitchen_membership_id, from_self, targeting_self } = filters ?? {};

    if(page_number) {
      base.push({ page_number });
    }
    if (user_kitchen_membership_id) {
      base.push({ user_kitchen_membership_id });
    }
    if (from_self) {
      base.push({ from_self });
    }
    if (targeting_self) {
      base.push({ targeting_self });
    }

    return base;
  };

  public static readonly GET_RECIPE_SHARE = (id?: number): RcpQueryKey => {
    const base: RcpQueryKey = ["recipeShare"];
    if (id) {
      base.push({ id });
    }
    return base;
  };
}
