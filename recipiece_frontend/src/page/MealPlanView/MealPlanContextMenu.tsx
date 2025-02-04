import { MealPlanSchema, ShoppingListSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { MoreVertical, Pencil, Settings, Share, ShoppingBasket, Trash } from "lucide-react";
import { FC, Fragment, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAppendShoppingListItemsMutation,
  useCreateMealPlanShareMutation,
  useDeleteMealPlanMutation,
  useGetSelfQuery,
  useListShoppingListsQuery,
  useUpdateMealPlanMutation,
} from "../../api";
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
  useToast,
} from "../../component";
import { DialogContext } from "../../context";
import { AddMealPlanToShoppingListForm, ModifyMealPlanForm } from "../../dialog";
import { useLayout } from "../../hooks";

export const MealPlanContextMenu: FC<{ readonly mealPlan?: MealPlanSchema }> = ({ mealPlan }) => {
  const navigate = useNavigate();

  const { isMobile } = useLayout();
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { toast } = useToast();

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

  const { mutateAsync: appendShoppingListItems } = useAppendShoppingListItemsMutation();
  const { mutateAsync: shareMealPlan } = useCreateMealPlanShareMutation();
  const { mutateAsync: updateMealPlan } = useUpdateMealPlanMutation();
  const { mutateAsync: deleteMealPlan } = useDeleteMealPlanMutation();

  const onAddToShoppingList = useCallback(
    (shoppingList: ShoppingListSchema) => {
      pushDialog("addMealPlanToShoppingList", {
        mealPlan: mealPlan!,
        shoppingList: shoppingList,
        onClose: () => popDialog("addMealPlanToShoppingList"),
        onSubmit: async (formData: AddMealPlanToShoppingListForm) => {
          try {
            await appendShoppingListItems({
              shopping_list_id: shoppingList.id,
              items: formData.items
                .filter((item) => item.selected)
                .map((item) => {
                  return {
                    content: item.name,
                    notes: item.notes ?? "",
                  };
                }),
            });
            toast({
              title: "Items Added",
              description: "The items were added to your shopping list!",
            });
          } catch {
            toast({
              title: "Unable to Add Items",
              description: "The items could not be added to your shopping list. Try again later.",
              variant: "destructive",
            });
          } finally {
            popDialog("addMealPlanToShoppingList");
          }
        },
      });
    },
    [pushDialog, mealPlan, popDialog, appendShoppingListItems, toast]
  );

  const mobileOnAddToShoppingList = useCallback(() => {
    pushDialog("mobileShoppingLists", {
      onClose: () => popDialog("mobileShoppingLists"),
      onSubmit: (list: ShoppingListSchema) => {
        popDialog("mobileShoppingLists");
        onAddToShoppingList(list);
      },
    });
  }, [pushDialog, popDialog, onAddToShoppingList]);

  const onShare = useCallback(() => {
    pushDialog("share", {
      displayName: "Meal Plan",
      entity_id: mealPlan!.id,
      entity_type: "meal_plan",
      onClose: () => popDialog("share"),
      onSubmit: async (membership: UserKitchenMembershipSchema) => {
        try {
          await shareMealPlan({
            meal_plan_id: mealPlan!.id,
            user_kitchen_membership_id: membership.id,
          });
          toast({
            title: "Meal Plan Shared",
            description: `Your meal plan has been shared to ${membership.destination_user.username}`,
          });
        } catch {
          toast({
            title: "Error Sharing Meal Plan",
            description: "There was an error sharing your meal plan. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("share");
        }
      },
    });
  }, [pushDialog, mealPlan, popDialog, shareMealPlan, toast]);

  const onModifyMealPlan = useCallback(() => {
    pushDialog("modifyMealPlan", {
      mealPlan: mealPlan,
      onClose: () => popDialog("modifyMealPlan"),
      onSubmit: async (formData: ModifyMealPlanForm) => {
        try {
          await updateMealPlan({
            ...formData,
            id: mealPlan?.id,
          });
          toast({
            title: "Meal Plan Updated",
            description: "Your meal plan has been updated.",
          });
        } catch {
          toast({
            title: "Unable to Update Meal Plan",
            description: "There was an error updating your meal plan. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("modifyMealPlan");
        }
      },
    });
  }, [mealPlan, popDialog, pushDialog, toast, updateMealPlan]);

  const onDeleteMealPlan = useCallback(() => {
    pushDialog("deleteMealPlan", {
      mealPlan: mealPlan,
      onClose: () => popDialog("deleteMealPlan"),
      onSubmit: async () => {
        try {
          await deleteMealPlan(mealPlan!);
          navigate("/dashboard");
          toast({
            title: "Meal Plan Deleted",
            description: "Your meal plan has been deleted.",
          });
        } catch {
          toast({
            title: "Error Deleting Meal Plan",
            description: "There was an error deleting your meal plan. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("deleteMealPlan");
        }
      },
    });
  }, [deleteMealPlan, mealPlan, navigate, popDialog, pushDialog, toast]);

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
          <DropdownMenuItem onClick={onModifyMealPlan}>
            <Pencil /> Edit
          </DropdownMenuItem>
        );
      }
    }
    return array;
  }, [user, mealPlan, navigate, onShare, onModifyMealPlan]);

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
                <LoadingGroup variant="spinner" className="h-7 w-7" isLoading={isLoadingShoppingLists}>
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
  }, [user, mealPlan, isMobile, mobileOnAddToShoppingList, isLoadingShoppingLists, shoppingLists, onAddToShoppingList]);

  const deletionItems = useMemo(() => {
    const items = [];
    if (user && mealPlan) {
      if (user.id === mealPlan.user_id) {
        items.push(
          <DropdownMenuItem className="text-destructive" onClick={onDeleteMealPlan}>
            <Trash /> Delete Meal Plan
          </DropdownMenuItem>
        );
      }
    }
    return items;
  }, [user, mealPlan, onDeleteMealPlan]);

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
        {isLoadingUser && <LoadingSpinner className="h-4 w-4" />}
        {!!user && !!mealPlan && allItems.map((comp, idx) => <Fragment key={idx}>{comp}</Fragment>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
