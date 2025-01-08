import { ListRecipeFilters, ListRecipeSharesFilters } from "../../data";

export class RecipeQueryKeys {
  public static readonly GET_RECIPE = (recipeId: number) => {
    return [
      "recipe",
      {
        id: recipeId,
      },
    ];
  };

  public static readonly LIST_RECIPE = (filters?: Partial<ListRecipeFilters>) => {
    const base: any[] = ["listRecipe"];
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

  public static readonly LIST_RECIPES_FOR_MEAL_PLAN = (filters?: Partial<ListRecipeFilters>) => {
    const base: any[] = ["recipeMealPlanSearch"];
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

  public static readonly LIST_RECIPES_AVAILABLE_TO_COOKBOOK = (filters?: Partial<{ readonly search: string; readonly cookbook_id: number }>) => {
    const base: any[] = ["recipeCookbookSearch"];
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

  public static readonly LIST_RECIPE_SHARES = (filters?: ListRecipeSharesFilters) => {
    const base: any[] = ["listRecipeShares"];
    const { page_number = 0, user_kitchen_membership_id, from_self, targeting_self } = filters ?? {};

    base.push({ page_number });
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

  public static readonly GET_RECIPE_SHARE = (recipeShareId: number) => {
    return ["recipeShare", recipeShareId];
  };
}
