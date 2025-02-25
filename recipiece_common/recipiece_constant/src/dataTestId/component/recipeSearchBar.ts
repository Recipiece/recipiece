export class RecipeSearchBar {
  public static readonly INPUT_SEARCH = (base?: string): string => {
    return `input-search-${base}`;
  };

  public static readonly BUTTON_TOGGLE_ADVANCED_SEARCH = (base?: string): string => {
    return `button-toggle-advanced-search-${base}`;
  };

  public static readonly CHECKBOX_SHARED_RECIPES = (base?: string): string => {
    return `checkbox-shared-recipes-${base}`;
  };

  public static readonly BUTTON_ADVANCED_SEARCH = (base?: string): string => {
    return `button-advanced-search-${base}`;
  };

  public static readonly INPUT_INGREDIENT_SEARCH = (base?: string): string => {
    return `input-ingredient-search-${base}`;
  };

  public static readonly INPUT_TAG_SEARCH = (base?: string): string => {
    return `input-tag-search-${base}`;
  }

  public static readonly BADGE_INGREDIENT = (base?: string): string => {
    return `badge-ingredient-${base}`;
  };

  public static readonly BADGE_TAG = (base?: string): string => {
    return `badge-tag-${base}`;
  }

  public static readonly INGREDIENT_SEARCH = (base?: string): string => {
    return `ingredient-search-${base}`;
  }

  public static readonly TAG_SEARCH = (base?: string): string => {
    return `tag-search-${base}`;
  }
}
