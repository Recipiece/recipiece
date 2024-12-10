import { AddRecipeToShoppingListDialog } from "./AddRecipeToShoppingList";
import { AddTimeToTimerDialog } from "./AddTimeToTimer";
import { CreateCookbookDialog } from "./CreateCookbook";
import { CreateShoppingListDialog } from "./CreateShoppingList";
import { CreateTimerDialog } from "./CreateTimer";
import { DeleteRecipeDialog } from "./DeleteRecipe";
import { ImportRecipesDialog } from "./ImportRecipes";
import { MobileCreateMenuDialog } from "./MobileCreateMenu";
import { MobileListCookbooksDialog } from "./MobileListCookbooks";
import { MobileListShoppingListsDialog } from "./MobileListShoppingLists";
import { ParseRecipeFromURLDialog } from "./ParseRecipeFromURL";
import { SearchRecipesDialog } from "./SearchRecipes";

export const Dialogs = {
  createCookbook: {
    component: CreateCookbookDialog,
  },
  searchRecipes: {
    component: SearchRecipesDialog,
  },
  parseRecipeFromURL: {
    component: ParseRecipeFromURLDialog,
  },
  deleteRecipe: {
    component: DeleteRecipeDialog,
  },
  createShoppingList: {
    component: CreateShoppingListDialog,
  },
  mobileCreateMenu: {
    component: MobileCreateMenuDialog,
  },
  mobileShoppingLists: {
    component: MobileListShoppingListsDialog,
  },
  mobileCookbooks: {
    component: MobileListCookbooksDialog,
  },
  importRecipes: {
    component: ImportRecipesDialog,
  },
  createTimer: {
    component: CreateTimerDialog,
  },
  addTimeToTimer: {
    component: AddTimeToTimerDialog,
  },
  addRecipeToShoppingList: {
    component: AddRecipeToShoppingListDialog,
  }
};
