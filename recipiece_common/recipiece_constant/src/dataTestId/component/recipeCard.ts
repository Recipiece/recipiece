export class RecipeCard {
  public static readonly CONTAINER_CARD_HEADER = (base?: any): string => {
    return `container-card-header-${base}`;
  }

  public static readonly CARD_TITLE = (base?: any): string => {
    return `card-title-${base}`;
  }

  public static readonly CONTAINER_CARD_CONTENT = (base?: any): string => {
    return `container-card-content-${base}`;
  }

  public static readonly PARAGRAPH_CARD_DESCRIPTION = (base?: any): string => {
    return `paragraph-card-description-${base}`;
  }

  public static readonly RECIPE_CONTEXT_MENU = (base?: any): string => {
    return `recipe-context-menu-${base}`;
  }

  public static readonly BUTTON_RECIPE_CONTEXT_MENU_TRIGGER = (base?: any): string => {
    return `button-recipe-context-menu-trigger-${base}`;
  }
}