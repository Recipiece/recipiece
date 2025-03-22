import { ListRecipesQuerySchema } from "@recipiece/types";
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
      const {
        page_number,
        cookbook_id,
        search,
        cookbook_attachments_filter,
        user_kitchen_membership_ids,
        ingredients,
        tags,
      } = filters;
      if (page_number) {
        base.push({ page_number });
      }

      if (cookbook_id) {
        base.push({ cookbook_id });
      }

      if (cookbook_attachments_filter) {
        base.push({ cookbook_attachments_filter });
      }

      if (user_kitchen_membership_ids) {
        base.push({ user_kitchen_membership_ids });
      }

      if (search) {
        base.push({ search });
      }

      if (ingredients && ingredients.length > 0) {
        base.push({ ingredients: ingredients.join(",") });
      }

      if (tags && tags.length > 0) {
        base.push({ tags: tags.join(",") });
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

  public static readonly LIST_RECIPES_AVAILABLE_TO_COOKBOOK = (
    filters?: Partial<{ readonly search: string; readonly cookbook_id: number }>
  ): RcpQueryKey => {
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
}
