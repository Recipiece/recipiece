export class RecipeEditPage {
  public static readonly INPUT_NAME = "input-recipe-name";
  public static readonly INPUT_SERVINGS = "input-servings";
  public static readonly TEXTAREA_DESCRIPTION = "textarea-recipe-description";
  public static readonly BUTTON_CANCEL = "button-cancel";
  public static readonly BUTTON_SAVE = "button-save";
  public static readonly NOT_FOUND = "not-found-recipe-edit";

  public static readonly TYPEAHEAD_INPUT_TAGS = "typeahead-input-tags";
  public static readonly BADGE_TAG = (base?: any): string => {
    return `badge-tag-${base}`;
  }

  public static readonly BUTTON_ADD_INGREDIENT = "button-add-ingredient";
  public static readonly DIV_INGREDIENT_DROP_TARGET = (base?: any): string => {
    return `div-ingredient-drag-target-${base}`;
  }
  public static readonly BUTTON_REMOVE_INGREDIENT = (base?: any): string => {
    return `button-remove-ingredient-${base}`;
  }
  public static readonly INGREDIENT_DRAG_HANDLE = (base?: any): string => {
    return `ingredient-drag-handle-${base}`;
  }
  public static readonly INPUT_INGREDIENT_NAME = (base?: any): string => {
    return `input-ingredient-name-${base}`;
  }
  public static readonly INPUT_INGREDIENT_AMOUNT = (base?: any): string => {
    return `input-ingredient-amount-${base}`;
  }
  public static readonly TYPEAHEAD_INPUT_INGREDIENT_UNIT = (base?: any): string => {
    return `input-ingredient-unit-${base}`;
  }

  public static readonly BUTTON_ADD_STEP = "button-add-step";
  public static readonly DIV_STEP_DROP_TARGET = (base?: any): string => {
    return `div-step-drag-target-${base}`;
  }
  public static readonly STEP_DRAG_HANDLE = (base?: any): string => {
    return `step-drag-handle-${base}`;
  }
  public static readonly BUTTON_REMOVE_STEP = (base?: any): string => {
    return `button-remove-step-${base}`;
  }
  public static readonly TEXTAREA_STEP_CONTENT = (base?: any): string => {
    return `textarea-step-content-${base}`;
  }
}
