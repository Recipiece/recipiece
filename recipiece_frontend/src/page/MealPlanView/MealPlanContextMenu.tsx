import { FC, useContext, useMemo, useState } from "react";
import { DialogContext } from "../../context";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, LoadingGroup, LoadingSpinner } from "../../component";
import { MoreVertical, Pencil, Settings, Share, ShoppingBasket, Trash } from "lucide-react";
import { useGetSelfQuery } from "../../api";
import { MealPlanSchema } from "@recipiece/types";
import { useNavigate } from "react-router-dom";

export const MealPlanContextMenu: FC<{ readonly mealPlan?: MealPlanSchema }> = ({ mealPlan }) => {
  const navigate = useNavigate();
  const { pushDialog, popDialog } = useContext(DialogContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  const manageMealPlanItems = useMemo(() => {
    const array = [];
    if (user && mealPlan) {
      array.push(
        <DropdownMenuItem onClick={() => navigate(`/meal-plan/view/${mealPlan!.id}/configuration`)}>
          <Settings /> <span>Configure</span>
        </DropdownMenuItem>
      );
      if (user?.id === mealPlan.user_id) {
        array.push(
          <DropdownMenuItem>
            <Share /> Share
          </DropdownMenuItem>
        );
        array.push(
          <DropdownMenuItem>
            <Pencil /> <span>Edit</span>
          </DropdownMenuItem>
        );
      }
    }
    return array;
  }, [user, mealPlan]);

  const interactionItems = useMemo(() => {
    const items = [];
    if (user && mealPlan) {
      items.push(
        <DropdownMenuItem>
          <ShoppingBasket /> Add to Shopping List
        </DropdownMenuItem>
      );
    }
    return items;
  }, [user, mealPlan]);

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
