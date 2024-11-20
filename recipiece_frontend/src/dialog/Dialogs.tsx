import { CreateCookbookDialog } from "./CreateCookbook";
import { CreateShoppingListDialog } from "./CreateShoppingList";
import { DeleteRecipeDialog } from "./DeleteRecipe";
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
};
