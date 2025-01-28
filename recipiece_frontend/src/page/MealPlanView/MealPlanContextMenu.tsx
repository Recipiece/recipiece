import { FC, useCallback, useContext, useMemo, useState } from "react";
import { DialogContext } from "../../context";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  LoadingGroup,
  LoadingSpinner,
} from "../../component";
import { MoreVertical, Pencil, Settings, Share, ShoppingBasket, Trash } from "lucide-react";
import { useGetSelfQuery, useListShoppingListsQuery } from "../../api";
import { MealPlanSchema, ShoppingListSchema } from "@recipiece/types";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../../hooks";

export const MealPlanContextMenu: FC<{ readonly mealPlan?: MealPlanSchema }> = ({ mealPlan }) => {
  const navigate = useNavigate();

  const { isMobile } = useLayout();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();
  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery(
    {
      page_number: 0,
    },
    {
      enabled: !isMobile,
    }
  );

  const onAddToShoppingList = useCallback((shoppingList: ShoppingListSchema) => {
    pushDialog("addMealPlanToShoppingList", {
      mealPlan: mealPlan,
      shoppingList: shoppingList,
      onClose: () => popDialog("addMealPlanToShoppingList"),
      onSubmit: () => {

      }
    })
  }, [pushDialog, popDialog]);

  const mobileOnAddToShoppingList = useCallback(() => {
    pushDialog("mobileShoppingLists", {
      onClose: () => popDialog("mobileShoppingLists"),
      onSubmit: (list: ShoppingListSchema) => {
        popDialog("mobileShoppingLists");
        onAddToShoppingList(list);
      }
    })
  }, [pushDialog, popDialog, onAddToShoppingList]);

  const onShare = useCallback(() => {
    pushDialog("share", {
      displayName: "Meal Plan",
      entity_id: mealPlan!.id,
      entity_type: "meal_plan",
      onClose: () => popDialog("share"),
      onSubmit: () => {

      }
    })
  }, [pushDialog, popDialog]);

  const manageMealPlanItems = useMemo(() => {
    const array = [];
    if (user && mealPlan) {
      array.push(
        <DropdownMenuItem onClick={() => navigate(`/meal-plan/view/${mealPlan!.id}/configuration`)}>
          <Settings /> Configure
        </DropdownMenuItem>
      );
      if (user?.id === mealPlan.user_id) {
        array.push(
          <DropdownMenuItem onClick={onShare}>
            <Share /> Share
          </DropdownMenuItem>
        );
        array.push(
          <DropdownMenuItem>
            <Pencil /> Edit
          </DropdownMenuItem>
        );
      }
    }
    return array;
  }, [user, mealPlan]);

  const interactionItems = useMemo(() => {
    const items = [];
    if (user && mealPlan) {
      if (isMobile) {
        items.push(
          <DropdownMenuItem onClick={mobileOnAddToShoppingList}>
            <ShoppingBasket /> Add to Shopping List
          </DropdownMenuItem>
        );
      } else {
        items.push(
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ShoppingBasket /> Add to Shopping List
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <LoadingGroup variant="spinner" className="w-7 h-7" isLoading={isLoadingShoppingLists}>
                  {(shoppingLists?.data || []).map((shoppingList) => {
                    return (
                      <DropdownMenuItem onClick={() => onAddToShoppingList(shoppingList)} key={shoppingList.id}>
                        {shoppingList.name}
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
    return items;
  }, [user, mealPlan, isMobile]);

  const deletionItems = useMemo(() => {
    const items = [];
    if (user && mealPlan) {
      if (user.id === mealPlan.user_id) {
        items.push(
          <DropdownMenuItem className="text-destructive">
            <Trash /> Delete Meal Plan
          </DropdownMenuItem>
        );
      }
    }
    return items;
  }, [user, mealPlan]);

  const allItems = useMemo(() => {
    const items = [];
    items.push(...manageMealPlanItems);
    if (items.length > 0 && interactionItems.length > 0) {
      items.push(<DropdownMenuSeparator />);
    }

    items.push(...interactionItems);
    if (items.length > 0 && deletionItems.length > 0) {
      items.push(<DropdownMenuSeparator />);
    }

    items.push(...deletionItems);

    return items;
  }, [manageMealPlanItems, deletionItems, interactionItems]);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isLoadingUser && <LoadingSpinner className="w-4 h-4" />}
        {!!user && !!mealPlan && allItems.map((comp) => <>{comp}</>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
