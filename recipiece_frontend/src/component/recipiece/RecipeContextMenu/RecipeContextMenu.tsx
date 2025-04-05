import { DataTestId } from "@recipiece/constant";
import { RecipeSchema } from "@recipiece/types";
import { ArrowDownLeft, ArrowUpRight, BookMinus, Edit, RefreshCw, Scaling, Trash, Utensils } from "lucide-react";
import { FC, Fragment, useCallback, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForkRecipeMutation, useGetCookbookByIdQuery, useRemoveRecipeFromCookbookMutation } from "../../../api";
import { DialogContext } from "../../../context";
import { ScaleRecipeSubmit, useDeleteRecipeDialog } from "../../../dialog";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, useToast } from "../../shadcn";
import { AddToOptions } from "./AddToOptions";

export interface RecipeContextMenuProps {
  readonly canAddToCookbook?: boolean;
  readonly canAddToShoppingList?: boolean;
  readonly canAddToMealPlan?: boolean;
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
  canAddToMealPlan,
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
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { data: cookbook } = useGetCookbookByIdQuery(cookbookId!, {
    enabled: !!cookbookId,
  });

  const { mutateAsync: forkRecipe } = useForkRecipeMutation();
  const { mutateAsync: removeRecipeFromCookbook } = useRemoveRecipeFromCookbookMutation();
  const { onDeleteRecipe } = useDeleteRecipeDialog(recipe);

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

    // if (addToOptions.length > 0) {
    //   if (items.length > 0) {
    //     items.push(<DropdownMenuSeparator />);
    //   }
    //   items.push(...addToOptions);
    // }

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
  }, [editOptions, removeItems, resetOptions, scalingOptions]);

  return (
    <DropdownMenuContent data-testid={DataTestId.RecipeContextMenu.DROPDOWN_MENU(dataTestId)}>
      <AddToOptions
        recipe={recipe}
        canAddToMealPlan={!!canAddToMealPlan}
        canAddToCookbook={!!canAddToCookbook}
        canAddToShoppingList={!!canAddToShoppingList}
        dataTestId={dataTestId}
      />
      {allItems.map((opt, idx) => {
        return <Fragment key={idx}>{opt}</Fragment>;
      })}
    </DropdownMenuContent>
  );
};
