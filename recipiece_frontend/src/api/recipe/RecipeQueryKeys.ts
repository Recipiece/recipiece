import { ListRecipeFilters } from "../../data";

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
}
