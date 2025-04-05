import { DataTestId } from "@recipiece/constant";
import { RecipeSchema } from "@recipiece/types";
import { Book, GanttChart, ShoppingBasket } from "lucide-react";
import { FC, useState } from "react";
import { useListCookbooksQuery, useListMealPlansQuery, useListShoppingListsQuery } from "../../../../api";
import { useLayout } from "../../../../hooks";
import { DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "../../../shadcn";
import { LoadingGroup } from "../../LoadingGroup";
import { useAddToCookbookModalMadness } from "./useAddToCookbook";
import { useAddToMealPlanModalMadness } from "./useAddToMealPlan";
import { useAddToShoppingListModalMadness } from "./useAddToShoppingList";

export const AddToOptions: FC<{
  readonly recipe: RecipeSchema;
  readonly canAddToMealPlan: boolean;
  readonly canAddToShoppingList: boolean;
  readonly canAddToCookbook: boolean;
  readonly dataTestId?: string;
}> = ({ recipe, canAddToCookbook, canAddToMealPlan, canAddToShoppingList, dataTestId }) => {
  const { isMobile } = useLayout();

  const { addToCookbook } = useAddToCookbookModalMadness(recipe);
  const { addToShoppingList } = useAddToShoppingListModalMadness(recipe);
  const { addToMealPlan } = useAddToMealPlanModalMadness(recipe);

  /**
   * Save the bytes, and don't fetch these queries until the user actually opens the context menu for them
   */
  const [isShoppingListContextMenuOpen, setIsShoppingListContextMenuOpen] = useState(false);
  const [isMealPlanContexMenuOpen, setIsMealPlanContexMenuOpen] = useState(false);
  const [isCookbookListContextMenuOpen, setIsCookbookContextMenuOpen] = useState(false);

  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery(
    {
      page_number: 0,
    },
    {
      enabled: canAddToShoppingList && isShoppingListContextMenuOpen,
    }
  );

  const { data: cookbooks, isLoading: isLoadingCookbook } = useListCookbooksQuery(
    {
      page_number: 0,
      recipe_id: recipe.id,
      recipe_id_filter: "exclude",
    },
    {
      enabled: canAddToCookbook && isCookbookListContextMenuOpen,
    }
  );

  const { data: mealPlans, isLoading: isLoadingMealPlans } = useListMealPlansQuery(
    {
      page_number: 0,
    },
    { enabled: canAddToMealPlan && isMealPlanContexMenuOpen }
  );

  const items = [];

  if (canAddToMealPlan) {
    if (isMobile) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_MEAL_PLAN(dataTestId)} onClick={() => addToMealPlan()}>
          <GanttChart /> Add to Meal Plan
        </DropdownMenuItem>
      );
    } else {
      items.push(
        <DropdownMenuSub onOpenChange={(open) => setIsMealPlanContexMenuOpen(open)}>
          <DropdownMenuSubTrigger data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_MEAL_PLAN(dataTestId)}>
            <GanttChart />
            Add to Meal Plan
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <LoadingGroup variant="spinner" className="h-7 w-7" isLoading={isLoadingMealPlans}>
                {(mealPlans?.data || []).map((mealPlan) => {
                  return (
                    <DropdownMenuItem
                      data-testid={`${DataTestId.RecipeContextMenu.BUTTON_AVAILABLE_MEAL_PLAN(dataTestId)}-${mealPlan.id}`}
                      key={mealPlan.id}
                      onClick={() => addToMealPlan(mealPlan)}
                    >
                      {mealPlan.name}
                    </DropdownMenuItem>
                  );
                })}
              </LoadingGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }
  }

  if (canAddToShoppingList) {
    if (isMobile) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_SHOPPING_LIST(dataTestId)} onClick={() => addToCookbook()}>
          <ShoppingBasket /> Add to Shopping List
        </DropdownMenuItem>
      );
    } else {
      items.push(
        <DropdownMenuSub onOpenChange={(open) => setIsShoppingListContextMenuOpen(open)}>
          <DropdownMenuSubTrigger data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_SHOPPING_LIST(dataTestId)}>
            <ShoppingBasket />
            Add to Shopping List
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <LoadingGroup variant="spinner" className="h-7 w-7" isLoading={isLoadingShoppingLists}>
                {(shoppingLists?.data || []).map((list) => {
                  return (
                    <DropdownMenuItem
                      data-testid={`${DataTestId.RecipeContextMenu.BUTTON_AVAILABLE_SHOPPING_LIST(dataTestId)}-${list.id}`}
                      key={list.id}
                      onClick={() => addToShoppingList(list)}
                    >
                      {list.name}
                    </DropdownMenuItem>
                  );
                })}
              </LoadingGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }
  }

  if (canAddToCookbook) {
    if (isMobile) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_COOKBOOK(dataTestId)} onClick={() => addToCookbook()}>
          <Book />
          Add to Cookbook
        </DropdownMenuItem>
      );
    } else {
      items.push(
        <DropdownMenuSub onOpenChange={(open) => setIsCookbookContextMenuOpen(open)}>
          <DropdownMenuSubTrigger data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_COOKBOOK(dataTestId)}>
            <Book />
            Add to Cookbook
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <LoadingGroup variant="spinner" className="h-7 w-7" isLoading={isLoadingCookbook}>
                {(cookbooks?.data || []).map((cookbook) => {
                  return (
                    <DropdownMenuItem
                      data-testid={`${DataTestId.RecipeContextMenu.BUTTON_AVAILABLE_COOKBOOK(dataTestId)}-${cookbook.id}`}
                      onClick={() => addToCookbook(cookbook)}
                      key={cookbook.id}
                    >
                      {cookbook.name}
                    </DropdownMenuItem>
                  );
                })}
              </LoadingGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }
  }

  return <>{items}</>;
};
