import { ChartNoAxesGantt, CircleArrowDown, CircleArrowUp, Edit, ListCheck, MoreVertical, RefreshCcw, ShoppingBasket, Trash } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAppendShoppingListItemsMutation,
  useDeleteMealPlanMutation,
  useGetMealPlanByIdQuery,
  useListItemsForMealPlanQuery,
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
  RecipieceMenuBarContext,
  Stack,
  useToast,
} from "../../component";
import { DialogContext } from "../../context";
import { MealPlan, MealPlanItem, ShoppingList, ShoppingListItem } from "../../data";
import { floorDateToDay } from "../../util";
import { MealPlanItemsCard } from "./MealPlanItemCard";
import { useLayout } from "../../hooks";
import { AddMealPlanToShoppingListForm } from "../../dialog";
import { createPortal } from "react-dom";

/**
 * This is a rather tricky form, and we're not even really using a form for this.
 * When we first load in, we will show only the current week, starting at monday.
 *
 * The user will be able to press an up button if the current week's start date is >= the meal plans created at date
 * This will load in the prior min(7, days between start of previous week and created at) days
 *
 * The user will also be able to press a down arrow that pops in more days below.
 *
 * The backend simply returns to us a list of all meal plan items on the meal plan for the given time period
 * We will organize that output into a form that looks like
 * {
 *   "<representation_date>": <meal_plan_items>[]
 * }
 * which is really just the meal plan items chunked into days.
 *
 * When the user presses the up/down, we'll expand the date range over which we want to look for items
 * and refetch that from the backend, re-reduce, and move along
 */

type MealPlanItemsFormType = { readonly [key: string]: Partial<MealPlanItem>[] };

export const MealPlanViewPage: FC = () => {
  const { id } = useParams();
  const mealPlanId = +id!;

  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isMobile } = useLayout();

  const [isEditing, setIsEditing] = useState(false);
  const [isShoppingListContextMenuOpen, setIsShoppingListContextMenuOpen] = useState(false);

  const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlanByIdQuery(mealPlanId);
  const { mutateAsync: updateMealPlan } = useUpdateMealPlanMutation();
  const { mutateAsync: deleteMealPlan } = useDeleteMealPlanMutation();

  const todayDate = useMemo(() => floorDateToDay(DateTime.now()), []);

  const [currentStartDate, setCurrentStartDate] = useState<DateTime>(todayDate);
  const [currentEndDate, setCurrentEndDate] = useState<DateTime>(todayDate.plus({ days: 5 }));

  const daysBetweenBounds: DateTime[] = useMemo(() => {
    const duration = currentEndDate.toLocal().diff(currentStartDate.toLocal(), ["days"]);
    const datesArray = [];
    for (let i = 0; i < duration.days; i++) {
      datesArray[i] = currentStartDate.plus({ days: i });
    }
    return datesArray;
  }, [currentStartDate, currentEndDate]);

  const { data: mealPlanItems, isLoading: isLoadingMealPlanItems } = useListItemsForMealPlanQuery(
    mealPlan?.id!,
    {
      start_date: currentStartDate.toUTC().toISO()!,
      end_date: currentEndDate.toUTC().toISO()!,
    },
    {
      disabled: !mealPlan,
    }
  );

  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery(
    {
      page_number: 0,
    },
    {
      disabled: !isShoppingListContextMenuOpen,
    }
  );

  const { mutateAsync: appendItemsToShoppingList } = useAppendShoppingListItemsMutation();

  const mealPlanCreatedAt = useMemo(() => {
    return DateTime.fromISO(mealPlan?.created_at!);
  }, [mealPlan]);

  const canAddToShoppingList = useMemo(() => {
    return !!(mealPlanItems?.meal_plan_items ?? []).find((item) => !!item.recipe);
  }, [mealPlanItems]);

  const defaultValues: MealPlanItemsFormType = useMemo(() => {
    if (mealPlanItems) {
      const reduced = mealPlanItems.meal_plan_items.reduce((accum: { [key: string]: MealPlanItem[] }, curr) => {
        const flooredIsoStartDate = floorDateToDay(DateTime.fromISO(curr.start_date)).toISO()!;
        const existingArrayForStartDate = accum[flooredIsoStartDate] ?? [];
        return {
          ...accum,
          [flooredIsoStartDate]: [
            ...existingArrayForStartDate,
            {
              ...curr,
              notes: curr.notes ?? "",
            },
          ],
        };
      }, {});
      return reduced;
    } else {
      return {};
    }
  }, [mealPlanItems]);

  const onLoadMoreAbove = useCallback(() => {
    const shifted = currentStartDate.minus({ days: 1 });
    const mealPlanCreatedAt = DateTime.fromISO(mealPlan!.created_at);
    const newVal = DateTime.max(shifted, mealPlanCreatedAt);
    setCurrentStartDate(newVal);
  }, [currentStartDate, mealPlan]);

  const onLoadMoreBelow = useCallback(() => {
    const shifted = currentEndDate.plus({ days: 1 });
    setCurrentEndDate(shifted);
  }, [currentEndDate]);

  const onResetDateBounds = useCallback(() => {
    setCurrentStartDate(todayDate);
    setCurrentEndDate(todayDate.plus({ days: 5 }));
  }, [todayDate]);

  const onEditMealPlan = useCallback(() => {
    pushDialog("modifyMealPlan", {
      mealPlan: mealPlan,
      onClose: () => popDialog("modifyMealPlan"),
      onSubmit: async (modifiedMealPlan: MealPlan) => {
        try {
          await updateMealPlan({ ...modifiedMealPlan, id: mealPlan?.id! });
          toast({
            title: "Meal Plan Updated",
            description: "Your meal plan was updated.",
          });
        } catch {
          toast({
            title: "Unable to Update Meal Plan",
            description: "We were unable to update your meal plan. Try again later",
            variant: "destructive",
          });
        } finally {
          popDialog("modifyMealPlan");
        }
      },
    });
  }, [pushDialog, mealPlan, popDialog, updateMealPlan, toast]);

  const onDeleteMealPlan = useCallback(async () => {
    pushDialog("deleteMealPlan", {
      mealPlan: mealPlan,
      onClose: () => popDialog("deleteMealPlan"),
      onSubmit: async (mealPlanToDelete: MealPlan) => {
        popDialog("deleteMealPlan");
        try {
          await deleteMealPlan(mealPlanToDelete.id);
          navigate("/");
          toast({
            title: "Meal Plan Deleted",
            description: "Your meal plan has been deleted",
          });
        } catch {
          toast({
            title: "Unable to Delete Meal Plan",
            description: "Your meal plan could not be deleted. Try again later.",
            variant: "destructive",
          });
        }
      },
    });
  }, [deleteMealPlan, mealPlan, navigate, popDialog, pushDialog, toast]);

  const onAddMealPlanToShoppingList = useCallback(
    (shoppingList: ShoppingList) => {
      pushDialog("addMealPlanToShoppingList", {
        mealPlan: mealPlan!,
        mealPlanItems: mealPlanItems!.meal_plan_items,
        onClose: () => popDialog("addMealPlanToShoppingList"),
        onSubmit: async (managedItems: AddMealPlanToShoppingListForm) => {
          try {
            const selectedItems: Partial<ShoppingListItem>[] = managedItems.items
              .filter((item) => item.selected)
              .map((item) => {
                return {
                  content: item.name,
                  notes: item.notes,
                };
              });

            if (selectedItems.length > 0) {
              await appendItemsToShoppingList({
                shopping_list_id: shoppingList.id,
                items: selectedItems,
              });
              toast({
                title: "Items Added",
                description: "The items have been added to your shopping list!",
              });
            }
          } catch {
            toast({
              title: "Error Adding Items",
              description: "There was an error adding the items to your shopping list. Try again later.",
              variant: "destructive",
            });
          } finally {
            popDialog("addMealPlanToShoppingList");
          }
        },
      });
    },
    [appendItemsToShoppingList, mealPlan, mealPlanItems, popDialog, pushDialog, toast]
  );

  const mobileOnAddToShoppingList = useCallback(() => {
    pushDialog("mobileShoppingLists", {
      onClose: () => popDialog("mobileShoppingLists"),
      onSubmit: (shoppingList: ShoppingList) => {
        popDialog("mobileShoppingLists");
        onAddMealPlanToShoppingList(shoppingList);
      },
    });
  }, [pushDialog, popDialog, onAddMealPlanToShoppingList]);

  const contextMenu = useMemo(() => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="sm:ml-auto text-primary">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!isEditing && (
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <ChartNoAxesGantt /> Manage Meals
            </DropdownMenuItem>
          )}
          {isEditing && (
            <DropdownMenuItem onClick={() => setIsEditing(false)}>
              <ListCheck /> Save Meals
            </DropdownMenuItem>
          )}
          {!isMobile && (
            <DropdownMenuSub onOpenChange={(open) => setIsShoppingListContextMenuOpen(open)}>
              <DropdownMenuSubTrigger disabled={!canAddToShoppingList}>
                <ShoppingBasket />
                Add to Shopping List
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <LoadingGroup variant="spinner" className="w-7 h-7" isLoading={isLoadingShoppingLists}>
                    {(shoppingLists?.data || []).map((list) => {
                      return (
                        <DropdownMenuItem onClick={() => onAddMealPlanToShoppingList(list)} key={list.id}>
                          {list.name}
                        </DropdownMenuItem>
                      );
                    })}
                  </LoadingGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          {isMobile && (
            <DropdownMenuItem disabled={!canAddToShoppingList} onClick={mobileOnAddToShoppingList}>
              <ShoppingBasket /> Add to Shopping List
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onResetDateBounds}>
            <RefreshCcw /> Reset View
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEditMealPlan}>
            <Edit /> Edit Meal Plan
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={onDeleteMealPlan}>
            <Trash /> Delete Meal Plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [canAddToShoppingList, isEditing, isLoadingShoppingLists, isMobile, mobileOnAddToShoppingList, onAddMealPlanToShoppingList, onDeleteMealPlan, onEditMealPlan, onResetDateBounds, shoppingLists?.data]);

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingMealPlan} className="h-8 w-52">
        <div className="flex flex-col sm:flex-row">
          <h1 className="text-2xl">{mealPlan?.name}</h1>
          {(isMobile && mobileMenuPortalRef && mobileMenuPortalRef.current) && createPortal(contextMenu, mobileMenuPortalRef?.current)}
          {!isMobile && <>{contextMenu}</>}
        </div>
      </LoadingGroup>
      {mealPlan && (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <Button variant="ghost" onClick={onLoadMoreAbove} disabled={currentStartDate <= mealPlanCreatedAt}>
              <CircleArrowUp />
            </Button>
          </div>
          {daysBetweenBounds.map((day) => {
            return (
              <MealPlanItemsCard
                key={day.toMillis()}
                isEditing={isEditing}
                startDate={floorDateToDay(day)}
                mealPlan={mealPlan}
                initialMealPlanItems={defaultValues[floorDateToDay(day).toISO()!]}
              />
            );
          })}
          <div className="text-center mt-2">
            <Button variant="ghost" onClick={onLoadMoreBelow} disabled={currentEndDate.diff(currentStartDate, ["months"]).months > 6}>
              <CircleArrowDown />
            </Button>
          </div>
        </div>
      )}
    </Stack>
  );
};
