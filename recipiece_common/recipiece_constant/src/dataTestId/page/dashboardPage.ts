import { RecipeCard } from "../component";

export class DashboardPage {
  public static readonly HEADING_TITLE = "heading-title";
  public static readonly BUTTON_ADD_RECIPE_HEADER = "add-recipe-header";
  public static readonly BUTTON_ADD_RECIPE_EMPTY = "button-add-recipe-empty";
  public static readonly PARAGRAPH_DESCRIPTION = "paragraph-description";
  public static readonly RECIPE_SEARCH_BAR = "dashboard-recipe-search-bar";
  public static readonly RECIPE_CARD = "dashboard-recipe-card";
  public static readonly PAGER = "dashboard-pager";
  public static readonly NOT_FOUND = "dashboard-not-found";

  public static readonly RECIPE_CARD_TITLE = (recipeId: number): string => {
    return `${RecipeCard.CARD_TITLE(DashboardPage.RECIPE_CARD)}-${recipeId}`;
  }

  public static readonly RECIPE_CARD_DESCRIPTION = (recipeId: number): string => {
    return `${RecipeCard.PARAGRAPH_CARD_DESCRIPTION(DashboardPage.RECIPE_CARD)}-${recipeId}`;
  }
}
