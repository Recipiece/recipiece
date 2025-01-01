import { AddMealPlanToShoppingListDialog } from "./AddMealPlanToShoppingList";
import { AddRecipeToShoppingListDialog } from "./AddRecipeToShoppingList";
import { AddTimeToTimerDialog } from "./AddTimeToTimer";
import { ConvertIngredientDialog } from "./ConvertIngredient";
import { CreateCookbookDialog } from "./CreateCookbook";
import { CreateShoppingListDialog } from "./CreateShoppingList";
import { CreateTimerDialog } from "./CreateTimer";
import { DeleteAccountDialog } from "./DeleteAccount";
import { DeleteMealPlanDialog } from "./DeleteMealPlan";
import { DeleteRecipeDialog } from "./DeleteRecipe";
import { DeleteShoppingListDialog } from "./DeleteShoppingList";
import { ImportRecipesDialog } from "./ImportRecipes";
import { MobileCreateMenuDialog } from "./MobileCreateMenu";
import { MobileListCookbooksDialog } from "./MobileListCookbooks";
import { MobileListMealPlansDialog } from "./MobileListMealPlans";
import { MobileListShoppingListsDialog } from "./MobileListShoppingLists";
import { ModifyMealPlanDialog } from "./ModifyMealPlan";
import { ParseRecipeFromURLDialog } from "./ParseRecipeFromURL";
import { RelativeScaleIngredientDialog } from "./RelativeScaleIngredient";
import { ScaleRecipeDialog } from "./ScaleRecipe";
import { SearchRecipesDialog } from "./SearchRecipes";
import { SearchRecipesForCookbookDialog } from "./SearchRecipesForCookbook";
import { SearchRecipesForMealPlanDialog } from "./SearchRecipesForMealPlan";

export const Dialogs = {
  createCookbook: {
    component: CreateCookbookDialog,
  },
  searchRecipes: {
    component: SearchRecipesDialog,
  },
  searchRecipesForCookbook: {
    component: SearchRecipesForCookbookDialog,
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
  },
  deleteShoppingList: {
    component: DeleteShoppingListDialog,
  },
  modifyMealPlan: {
    component: ModifyMealPlanDialog,
  },
  deleteMealPlan: {
    component: DeleteMealPlanDialog,
  },
  addMealPlanToShoppingList: {
    component: AddMealPlanToShoppingListDialog,
  },
  mobileMealPlans: {
    component: MobileListMealPlansDialog,
  },
  convertIngredient: {
    component: ConvertIngredientDialog,
  },
  relativeScaleIngredient: {
    component: RelativeScaleIngredientDialog,
  },
  searchRecipesForMealPlan: {
    component: SearchRecipesForMealPlanDialog,
  },
  scaleRecipe: {
    component: ScaleRecipeDialog,
  },
  deleteAccount: {
    component: DeleteAccountDialog,
  }
};
