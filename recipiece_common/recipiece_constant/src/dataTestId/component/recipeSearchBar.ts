export class RecipeSearchBar {
  public static readonly INPUT_SEARCH = (base?: any): string => {
    return `input-search-${base}`;
  };

  public static readonly BUTTON_TOGGLE_ADVANCED_SEARCH = (base?: any): string => {
    return `button-toggle-advanced-search-${base}`;
  };

  public static readonly CHECKBOX_SHARED_RECIPES = (base?: any): string => {
    return `checkbox-shared-recipes-${base}`;
  };

  public static readonly BUTTON_ADVANCED_SEARCH = (base?: any): string => {
    return `button-advanced-search-${base}`;
  };

  public static readonly INPUT_INGREDIENT_SEARCH = (base?: any): string => {
    return `input-ingredient-search-${base}`;
  };

  public static readonly INPUT_TAG_SEARCH = (base?: any): string => {
    return `input-tag-search-${base}`;
  }

  public static readonly INPUT_USER_KITCHEN_MEMBERSHIP_SEARCH = (base?: any): string => {
    return `input-user-kitchen-membership-search-${base}`;
  }

  public static readonly BADGE_INGREDIENT = (base?: any): string => {
    return `badge-ingredient-${base}`;
  };

  public static readonly BADGE_TAG = (base?: any): string => {
    return `badge-tag-${base}`;
  }

  public static readonly BADGE_USER_KITCHEN_MEMBERSHIP_SEARCH = (base?: any): string => {
    return `badge-user-kitchen-membership-${base}`;
  }

  public static readonly INGREDIENT_SEARCH = (base?: any): string => {
    return `ingredient-search-${base}`;
  }

  public static readonly TAG_SEARCH = (base?: any): string => {
    return `tag-search-${base}`;
  }

  public static readonly USER_KITCHEN_MEMBERSHIP_SEARCH = (base?: any): string => {
    return `user-kitchen-membership-search-${base}`;
  }
}
