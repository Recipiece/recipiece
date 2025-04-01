import { DataTestId } from "@recipiece/constant";
import { CookbookSchema, RecipeSchema, ShoppingListSchema } from "@recipiece/types";
import { ArrowDownLeft, ArrowUpRight, Book, BookMinus, Edit, RefreshCw, Scaling, ShoppingBasket, Trash, Utensils } from "lucide-react";
import { FC, Fragment, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAttachRecipeToCookbookMutation,
  useForkRecipeMutation,
  useGetCookbookByIdQuery,
  useListCookbooksQuery,
  useListShoppingListsQuery,
  useRemoveRecipeFromCookbookMutation,
} from "../../../api";
import { DialogContext } from "../../../context";
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
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
  readonly canRemoveFromCookbook?: boolean;
  readonly canScale?: boolean;
  readonly onScale?: (scaleFactor: number) => void;
  readonly canReset?: boolean;
  readonly onReset?: () => void;
  readonly recipe: RecipeSchema;
  readonly cookbookId?: number;
  readonly dataTestId?: string;
}

export const RecipeContextMenu: FC<RecipeContextMenuProps> = ({
  canAddToCookbook,
  canAddToShoppingList,
  canFork,
  canDelete,
  canEdit,
  canRemoveFromCookbook,
  canScale,
  onScale,
  canReset,
  onReset,
  recipe,
  cookbookId,
  dataTestId,
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

  const { data: cookbook } = useGetCookbookByIdQuery(cookbookId!, {
    enabled: !!cookbookId,
  });

  const { mutateAsync: forkRecipe } = useForkRecipeMutation();
  const { mutateAsync: removeRecipeFromCookbook } = useRemoveRecipeFromCookbookMutation();
  const { mutateAsync: addRecipeToCookbook } = useAttachRecipeToCookbookMutation();

  const { onAddToShoppingList } = useAddRecipeToShoppingListDialog(recipe);
  const { onDeleteRecipe } = useDeleteRecipeDialog(recipe);

  const mobileOnAddToShoppingList = useCallback(() => {
    pushDialog("mobileShoppingLists", {
      onClose: () => popDialog("mobileShoppingLists"),
      onSubmit: (shoppingList: ShoppingListSchema) => {
        popDialog("mobileShoppingLists");
        onAddToShoppingList(shoppingList.id);
      },
    });
  }, [pushDialog, popDialog, onAddToShoppingList]);

  const mobileOnAddToCookbook = useCallback(() => {
    pushDialog("mobileCookbooks", {
      excludeContainingRecipeId: recipe.id,
      onClose: () => popDialog("mobileCookbooks"),
      onSubmit: async (cookbook: CookbookSchema) => {
        try {
          await addRecipeToCookbook({
            recipe: recipe,
            cookbook: cookbook,
          });
          toast({
            title: "Recipe Added",
            description: "The recipe was added to your cookbook.",
          });
        } catch {
          toast({
            title: "Cannot add recipe to cookbook",
            description: "There was an issue trying to add your recipe to this cookbook. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("mobileCookbooks");
        }
      },
    });
  }, [pushDialog, recipe, popDialog, addRecipeToCookbook, toast]);

  const onAddToCookbook = useCallback(
    async (cookbook: CookbookSchema) => {
      try {
        await addRecipeToCookbook({
          recipe: recipe,
          cookbook: cookbook,
        });
        toast({
          title: "Recipe Added",
          description: "The recipe was added to your cookbook.",
        });
      } catch {
        toast({
          title: "Cannot add recipe to cookbook",
          description: "There was an issue trying to add your recipe to this cookbook. Try again later.",
          variant: "destructive",
        });
      }
    },
    [addRecipeToCookbook, recipe, toast]
  );

  const onRemoveRecipeFromCookbook = useCallback(async () => {
    try {
      await removeRecipeFromCookbook({
        recipe: recipe,
        cookbook: cookbook!,
      });
      toast({
        title: "Recipe removed",
        description: "The recipe was removed from the cookbook.",
      });
    } catch {
      toast({
        title: "Cannot remove recipe from cookbook",
        description: "There was an issue trying to remove your recipe from this cookbook. Try again later.",
        variant: "destructive",
      });
    }
  }, [removeRecipeFromCookbook, recipe, cookbook, toast]);

  const onForkRecipe = useCallback(async () => {
    try {
      const forkedRecipe = await forkRecipe({ original_recipe_id: recipe!.id });
      toast({
        title: "Recipe Forked!",
        description: `${recipe.name} was forked into your recipe collection.`,
      });
      navigate(`/recipe/view/${forkedRecipe.id}`);
    } catch {
      toast({
        title: "Failed to Fork Recipe",
        description: `${recipe!.name} could not be forked. Try again later.`,
        variant: "destructive",
      });
    }
  }, [forkRecipe, recipe, toast, navigate]);

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
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_RESET_CHANGES(dataTestId)} onClick={() => onReset?.()}>
          <RefreshCw /> Reset Changes
        </DropdownMenuItem>
      );
    }

    return items;
  }, [canReset, onReset, dataTestId]);

  const scalingOptions = useMemo(() => {
    const items = [];
    if (canScale) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_HALF_RECIPE(dataTestId)} onClick={() => onScale?.(0.5)}>
          <ArrowDownLeft />
          1/2 Recipe
        </DropdownMenuItem>
      );
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_DOUBLE_RECIPE(dataTestId)} onClick={() => onScale?.(2)}>
          <ArrowUpRight />
          2x Recipe
        </DropdownMenuItem>
      );
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_SCALE_CUSTOM(dataTestId)} onClick={onCustomScaleRecipe}>
          <Scaling />
          Scale Custom
        </DropdownMenuItem>
      );
    }

    return items;
  }, [canScale, onCustomScaleRecipe, onScale, dataTestId]);

  const addToOptions = useMemo(() => {
    const items = [];

    if (canAddToCookbook) {
      if (isMobile) {
        items.push(
          <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_COOKBOOK(dataTestId)} onClick={mobileOnAddToCookbook}>
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
                        onClick={() => onAddToCookbook(cookbook)}
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

    if (canAddToShoppingList) {
      if (isMobile) {
        items.push(
          <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_ADD_TO_SHOPPING_LIST(dataTestId)} onClick={mobileOnAddToShoppingList}>
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
                        onClick={() => onAddToShoppingList(list.id)}
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
    dataTestId,
  ]);

  const editOptions = useMemo(() => {
    const items = [];
    if (canFork) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_FORK_RECIPE(dataTestId)} onClick={onForkRecipe}>
          <Utensils /> Fork This Recipe
        </DropdownMenuItem>
      );
    }

    if (canEdit) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_EDIT_RECIPE(dataTestId)} onClick={() => navigate(`/recipe/edit/${recipe!.id}`)}>
          <Edit /> Edit This Recipe
        </DropdownMenuItem>
      );
    }

    return items;
  }, [dataTestId, canEdit, canFork, navigate, onForkRecipe, recipe]);

  const removeItems = useMemo(() => {
    const items = [];
    if (canRemoveFromCookbook) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_REMOVE_FROM_COOKBOOK(dataTestId)} onClick={onRemoveRecipeFromCookbook} className="text-destructive">
          <BookMinus /> Remove from Cookbook
        </DropdownMenuItem>
      );
    }

    if (canDelete) {
      items.push(
        <DropdownMenuItem data-testid={DataTestId.RecipeContextMenu.BUTTON_DELETE_RECIPE(dataTestId)} onClick={onDeleteRecipe} className="text-destructive">
          <Trash /> Delete Recipe
        </DropdownMenuItem>
      );
    }

    return items;
  }, [dataTestId, canDelete, canRemoveFromCookbook, onDeleteRecipe, onRemoveRecipeFromCookbook]);

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
    <DropdownMenuContent data-testid={DataTestId.RecipeContextMenu.DROPDOWN_MENU(dataTestId)}>
      {allItems.map((opt, idx) => {
        return <Fragment key={idx}>{opt}</Fragment>;
      })}
    </DropdownMenuContent>
  );
};
