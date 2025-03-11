
export class DashboardPage {
  public static readonly HEADING_TITLE = "heading-title";
  public static readonly BUTTON_ADD_RECIPE_HEADER = "add-recipe-header";
  public static readonly BUTTON_ADD_RECIPE_EMPTY = "button-add-recipe-empty";
  public static readonly PARAGRAPH_DESCRIPTION = "paragraph-description";
  public static readonly RECIPE_SEARCH_BAR = "dashboard-recipe-search-bar";
  public static readonly RECIPE_CARD = "dashboard-recipe-card";
  public static readonly PAGER = "dashboard-pager";
  public static readonly NOT_FOUND = "dashboard-not-found";
}

export class DashboardSidebar {
  public static readonly SIDEBAR_CONTENT = "dashboard-sidebar-group";
  public static readonly SIDEBAR_TRIGGER_DESKTOP = "sidebar-trigger-desktop";
  public static readonly SIDEBAR_TRIGGER_MOBILE = "sidebar-trigger-mobile";

  public static readonly SIDEBAR_GROUP_KITCHENS = "sidebar-group-kitchens";
  public static readonly SIDEBAR_BUTTON_YOUR_RECIPES = "sidebar-button-your-recipes";
  public static readonly SIDEBAR_BUTTON_ALL_RECIPES = "sidebar-button-all-recipes";
  public static readonly SIDEBAR_BUTTON_MEMBERSHIP = (base?: any) => {
    return `sidebar-button-membership-${base}`;
  }

  public static readonly SIDEBAR_GROUP_COOKBOOKS = "sidebar-group-cookbooks";
  public static readonly SIDEBAR_BUTTON_COOKBOOK = (base?: any) => {
    return `sidebar-button-cookbook-${base}`;
  }
}
