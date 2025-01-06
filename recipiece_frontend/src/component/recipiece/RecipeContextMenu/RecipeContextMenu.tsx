import {
  ArrowDownLeft,
  ArrowUpRight,
  Book,
  BookMinus,
  Edit,
  RefreshCw,
  Scaling,
  Share,
  ShoppingBasket,
  Trash,
  Utensils
} from "lucide-react";
import { FC, Fragment, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAttachRecipeToCookbookMutation,
  useCreateRecipeShareMutation,
  useForkRecipeMutation,
  useGetCookbookByIdQuery,
  useListCookbooksQuery,
  useListShoppingListsQuery,
  useRemoveRecipeFromCookbookMutation,
} from "../../../api";
import { DialogContext } from "../../../context";
import { Cookbook, Recipe, ShoppingList, UserKitchenMembership } from "../../../data";
import { ScaleRecipeSubmit, useAddRecipeToShoppingListDialog, useDeleteRecipeDialog } from "../../../dialog";
import { useLayout } from "../../../hooks";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  useToast,
} from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";

export interface RecipeContextMenuProps {
  readonly canAddToCookbook?: boolean;
  readonly canAddToShoppingList?: boolean;
  readonly canFork?: boolean;
  readonly canShare?: boolean;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
  readonly canRemoveFromCookbook?: boolean;
  readonly canScale?: boolean;
  readonly onScale?: (scaleFactor: number) => void;
  readonly canReset?: boolean;
  readonly onReset?: () => void;
  readonly recipe: Recipe;
  readonly cookbookId?: number;
}

export const RecipeContextMenu: FC<RecipeContextMenuProps> = ({
  canAddToCookbook,
  canAddToShoppingList,
  canFork,
  canShare,
  canDelete,
  canEdit,
  canRemoveFromCookbook,
  canScale,
  onScale,
  canReset,
  onReset,
  recipe,
  cookbookId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useLayout();
  const { pushDialog, popDialog } = useContext(DialogContext);

  /**
   * Save the bytes, and don't fetch these queries until the user actually opens the context menu for them
   */
  const [isShoppingListContextMenuOpen, setIsShoppingListContextMenuOpen] = useState(false);
  const [isCookbookListContextMenuOpen, setIsCookbookContextMenuOpen] = useState(false);

  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery(
    {
      page_number: 0,
    },
    {
      disabled: !canAddToShoppingList || !isShoppingListContextMenuOpen,
    }
  );

  const { data: cookbooks, isLoading: isLoadingCookbook } = useListCookbooksQuery(
    {
      page_number: 0,
      exclude_containing_recipe_id: recipe.id,
    },
    {
      disabled: !canAddToCookbook || !isCookbookListContextMenuOpen,
    }
  );

  const { data: cookbook } = useGetCookbookByIdQuery(cookbookId!, {
    disabled: !cookbookId,
  });

  const { mutateAsync: shareRecipe } = useCreateRecipeShareMutation();

  const { mutateAsync: forkRecipe } = useForkRecipeMutation({
    onSuccess: (recipe) => {
      toast({
        title: "Recipe Forked!",
        description: `${recipe.name} was forked into your recipe collection.`,
      });
    },
    onFailure: () => {
      toast({
        title: "Failed to Fork Recipe",
        description: `${recipe!.name} could not be forked. Try again later.`,
      });
    },
  });

  const { mutateAsync: removeRecipeFromCookbook } = useRemoveRecipeFromCookbookMutation({
    onFailure: () => {
      toast({
        title: "Cannot remove recipe from cookbook",
        description: "There was an issue trying to remove your recipe from this cookbook. Try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recipe removed",
        description: "The recipe was removed from the cookbook.",
      });
    },
  });

  const { mutateAsync: addRecipeToCookbook } = useAttachRecipeToCookbookMutation({
    onFailure: (err) => {
      console.error(err);
      toast({
        title: "Cannot add recipe to cookbook",
        description: "There was an issue trying to add your recipe to this cookbook. Try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recipe Added",
        description: "The recipe was added to your cookbook.",
      });
    },
  });

  const { onAddToShoppingList } = useAddRecipeToShoppingListDialog(recipe);
  const { onDeleteRecipe } = useDeleteRecipeDialog(recipe);

  const mobileOnAddToShoppingList = useCallback(() => {
    pushDialog("mobileShoppingLists", {
      onClose: () => popDialog("mobileShoppingLists"),
      onSubmit: (shoppingList: ShoppingList) => {
        popDialog("mobileShoppingLists");
        onAddToShoppingList(shoppingList.id);
      },
    });
  }, [pushDialog, popDialog, onAddToShoppingList]);

  const mobileOnAddToCookbook = useCallback(() => {
    pushDialog("mobileCookbooks", {
      excludeContainingRecipeId: recipe.id,
      onClose: () => popDialog("mobileCookbooks"),
      onSubmit: async (cookbook: Cookbook) => {
        try {
          await addRecipeToCookbook({
            recipe: recipe,
            cookbook: cookbook,
          });
        } catch {
        } finally {
          popDialog("mobileCookbooks");
        }
      },
    });
  }, [pushDialog, popDialog, addRecipeToCookbook, recipe]);

  const onAddToCookbook = useCallback(
    async (cookbook: Cookbook) => {
      try {
        await addRecipeToCookbook({
          recipe: recipe,
          cookbook: cookbook,
        });
      } catch {}
    },
    [addRecipeToCookbook, recipe]
  );

  const onRemoveRecipeFromCookbook = useCallback(async () => {
    try {
      await removeRecipeFromCookbook({
        recipe: recipe,
        cookbook: cookbook!,
      });
    } catch {
      // noop
    }
  }, [removeRecipeFromCookbook, cookbook, recipe]);

  const onShareRecipe = useCallback(async () => {
    pushDialog("shareRecipe", {
      recipe: recipe,
      onClose: () => popDialog("shareRecipe"),
      onSubmit: async (membership: UserKitchenMembership) => {
        try {
          await shareRecipe({
            user_kitchen_membership_id: membership.id,
            recipe_id: recipe.id,
          });
          toast({
            title: "Recipe Shared",
            description: `Your recipe has been sent to ${membership.destination_user.username}`,
          });
        } catch {
          toast({
            title: "Unable to Share Recipe",
            description: `Your recipe could not be shared with ${membership.destination_user.username}. Try again later.`,
            variant: "destructive",
          });
        } finally {
          popDialog("shareRecipe");
        }
      },
    });
  }, [popDialog, pushDialog, recipe, shareRecipe, toast]);

  const onForkRecipe = useCallback(async () => {
    try {
      const forkedRecipe = await forkRecipe({ original_recipe_id: recipe!.id });
      navigate(`/recipe/view/${forkedRecipe.data.id}`);
    } catch {
      // noop
    }
  }, [recipe, forkRecipe, navigate]);

  const onCustomScaleRecipe = useCallback(() => {
    pushDialog("scaleRecipe", {
      onClose: () => popDialog("scaleRecipe"),
      onSubmit: (data: ScaleRecipeSubmit) => {
        popDialog("scaleRecipe");
        onScale?.(data.scaleFactor);
      },
    });
  }, [onScale, popDialog, pushDialog]);

  const resetOptions = useMemo(() => {
    const items = [];

    if (canReset) {
      items.push(
        <DropdownMenuItem onClick={() => onReset?.()}>
          <RefreshCw /> Reset Changes
        </DropdownMenuItem>
      );
    }

    return items;
  }, [canReset, onReset]);

  const scalingOptions = useMemo(() => {
    const items = [];
    if (canScale) {
      items.push(
        <DropdownMenuItem onClick={() => onScale?.(0.5)}>
          <ArrowDownLeft />
          1/2 Recipe
        </DropdownMenuItem>
      );
      items.push(
        <DropdownMenuItem onClick={() => onScale?.(2)}>
          <ArrowUpRight />
          2x Recipe
        </DropdownMenuItem>
      );
      items.push(
        <DropdownMenuItem onClick={onCustomScaleRecipe}>
          <Scaling />
          Scale Custom
        </DropdownMenuItem>
      );
    }

    return items;
  }, [canScale, onCustomScaleRecipe, onScale]);

  const addToOptions = useMemo(() => {
    const items = [];

    if (canAddToCookbook) {
      if (isMobile) {
        items.push(
          <DropdownMenuItem onClick={mobileOnAddToCookbook}>
            <Book />
            Add to Cookbook
          </DropdownMenuItem>
        );
      } else {
        items.push(
          <DropdownMenuSub onOpenChange={(open) => setIsCookbookContextMenuOpen(open)}>
            <DropdownMenuSubTrigger>
              <Book />
              Add to Cookbook
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <LoadingGroup variant="spinner" className="w-7 h-7" isLoading={isLoadingCookbook}>
                  {(cookbooks?.data || []).map((cookbook) => {
                    return (
                      <DropdownMenuItem onClick={() => onAddToCookbook(cookbook)} key={cookbook.id}>
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

    if (canAddToShoppingList) {
      if (isMobile) {
        items.push(
          <DropdownMenuItem onClick={mobileOnAddToShoppingList}>
            <ShoppingBasket /> Add to Shopping List
          </DropdownMenuItem>
        );
      } else {
        items.push(
          <DropdownMenuSub onOpenChange={(open) => setIsShoppingListContextMenuOpen(open)}>
            <DropdownMenuSubTrigger>
              <ShoppingBasket />
              Add to Shopping List
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <LoadingGroup variant="spinner" className="w-7 h-7" isLoading={isLoadingShoppingLists}>
                  {(shoppingLists?.data || []).map((list) => {
                    return (
                      <DropdownMenuItem key={list.id} onClick={() => onAddToShoppingList(list.id)}>
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

    return items;
  }, [
    canAddToCookbook,
    canAddToShoppingList,
    cookbooks,
    isLoadingCookbook,
    isLoadingShoppingLists,
    isMobile,
    mobileOnAddToCookbook,
    mobileOnAddToShoppingList,
    onAddToCookbook,
    onAddToShoppingList,
    shoppingLists,
  ]);

  const editOptions = useMemo(() => {
    const items = [];
    if (canFork) {
      items.push(
        <DropdownMenuItem onClick={onForkRecipe}>
          <Utensils /> Fork This Recipe
        </DropdownMenuItem>
      );
    }

    if (canEdit) {
      items.push(
        <DropdownMenuItem onClick={() => navigate(`/recipe/edit/${recipe!.id}`)}>
          <Edit /> Edit This Recipe
        </DropdownMenuItem>
      );
    }

    if (canShare) {
      items.push(
        <DropdownMenuItem onClick={onShareRecipe}>
          <Share /> Share Recipe
        </DropdownMenuItem>
      );
    }

    return items;
  }, [canEdit, canFork, canShare, navigate, onForkRecipe, onShareRecipe, recipe]);

  const removeItems = useMemo(() => {
    const items = [];
    if (canRemoveFromCookbook) {
      items.push(
        <DropdownMenuItem onClick={onRemoveRecipeFromCookbook} className="text-destructive">
          <BookMinus /> Remove from Cookbook
        </DropdownMenuItem>
      );
    }

    if (canDelete) {
      items.push(
        <DropdownMenuItem onClick={onDeleteRecipe} className="text-destructive">
          <Trash /> Delete Recipe
        </DropdownMenuItem>
      );
    }

    return items;
  }, [canDelete, canRemoveFromCookbook, onDeleteRecipe, onRemoveRecipeFromCookbook]);

  const allItems = useMemo(() => {
    const items = [];
    if (resetOptions.length > 0) {
      items.push(...resetOptions);
    }

    if (scalingOptions.length > 0) {
      if (items.length > 0) {
        items.push(<DropdownMenuSeparator />);
      }
      items.push(...scalingOptions);
    }

    if (addToOptions.length > 0) {
      if (items.length > 0) {
        items.push(<DropdownMenuSeparator />);
      }
      items.push(...addToOptions);
    }

    if (editOptions.length > 0) {
      if (items.length > 0) {
        items.push(<DropdownMenuSeparator />);
      }
      items.push(...editOptions);
    }

    if (removeItems.length > 0) {
      if (items.length > 0) {
        items.push(<DropdownMenuSeparator />);
      }
      items.push(...removeItems);
    }

    return items;
  }, [addToOptions, editOptions, removeItems, resetOptions, scalingOptions]);

  return (
    <DropdownMenuContent>
      {allItems.map((opt, idx) => {
        return <Fragment key={idx}>{opt}</Fragment>;
      })}
    </DropdownMenuContent>
  );
};
