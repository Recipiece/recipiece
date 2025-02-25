export class RecipeCard {
  public static readonly CONTAINER_CARD_HEADER = (base?: string): string => {
    return `container-card-header-${base}`;
  }

  public static readonly CARD_TITLE = (base?: string): string => {
    return `card-title-${base}`;
  }

  public static readonly CONTAINER_CARD_CONTENT = (base?: string): string => {
    return `container-card-content-${base}`;
  }

  public static readonly PARAGRAPH_CARD_DESCRIPTION = (base?: string): string => {
    return `paragraph-card-description-${base}`;
  }

  public static readonly RECIPE_CONTEXT_MENU = (base?: string): string => {
    return `recipe-context-menu-${base}`;
  }

  public static readonly BUTTON_RECIPE_CONTEXT_MENU_TRIGGER = (base?: string): string => {
    return `button-recipe-context-menu-trigger-${base}`;
  }
}