export class MenuBar {
  public static readonly MENU_TRIGGER_ACCOUNT_DESKTOP = "menu-trigger-account-desktop";
  public static readonly MENU_TRIGGER_ACCOUNT_MOBILE = "menu-trigger-account-mobile";
  public static readonly MENU_ITEM_GOTO_MEMBERSHIPS = "menu-item-goto-memberships";
  public static readonly MENU_ITEM_GOTO_ACCOUNT = "menu-item-goto-account";
  public static readonly MENU_ITEM_SIGN_OUT = "menu-item-sign-out";

  public static readonly MENU_ITEM_HOME_DESKTOP = "menu-item-home-desktop";
  public static readonly MENU_ITEM_HOME_MOBILE = "menu-item-home-mobile";

  public static readonly MENU_TRIGGER_CREATE = "menu-trigger-create";
  public static readonly MENU_ITEM_RECIPE_FROM_URL = "menu-item-recipe-from-url";
  public static readonly MENU_ITEM_RECIPE_FROM_SCRATCH = "menu-item-recipe-from-scratch";

  public static readonly MENU_TRIGGER_MEAL_PLAN = "menu-trigger-meal-plan";
  public static readonly MENU_ITEM_CREATE_MEAL_PLAN = "menu-item-create-meal-plan";
  public static readonly MENU_ITEM_MEAL_PLAN = (base?: any): string => {
    return `menu-item-meal-plan-${base}`;
  };

  public static readonly MENU_TRIGGER_COOKBOOK = "menu-trigger-cookbook";
  public static readonly MENU_ITEM_CREATE_COOKBOOK = "menu-item-create-cookbook";
  public static readonly MENU_ITEM_COOKBOOK = (base?: any): string => {
    return `menu-item-cookbook-${base}`;
  };

  public static readonly MENU_TRIGGER_SHOPPING_LIST = "menu-trigger-shopping-list";
  public static readonly MENU_ITEM_CREATE_SHOPPING_LIST = "menu-item-create-shopping-list";
  public static readonly MENU_ITEM_SHOPPING_LIST = (base?: any): string => {
    return `menu-item-shopping-list-${base}`;
  };

  public static readonly FOOTER_MOBILE_MENU_BAR = "footer-mobile-menu-bar";
  public static readonly NAV_DESKTOP_MENU_BAR = "nav-desktop-menu-bar";

  public static readonly DROPDOWN_MENU_ACCOUNT_MOBILE = "dropdown-menu-mobile-account";
  
}
