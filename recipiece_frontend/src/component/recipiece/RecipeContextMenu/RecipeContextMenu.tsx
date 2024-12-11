import { Book, BookMinus, Edit, Share, ShoppingBasket, Trash, Utensils } from "lucide-react";
import { FC, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAttachRecipeToCookbookMutation,
  useForkRecipeMutation,
  useGetCookbookByIdQuery,
  useListCookbooksQuery,
  useListShoppingListsQuery,
  useRemoveRecipeFromCookbookMutation,
} from "../../../api";
import { Cookbook, Recipe, ShoppingList } from "../../../data";
import { useAddRecipeToShoppingListDialog, useDeleteRecipeDialog } from "../../../dialog";
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
import { useLayout } from "../../../hooks";
import { DialogContext } from "../../../context";

export interface RecipeContextMenuProps {
  readonly canAddToCookbook?: boolean;
  readonly canAddToShoppingList?: boolean;
  readonly canFork?: boolean;
  readonly canShare?: boolean;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
  readonly canRemoveFromCookbook?: boolean;
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
    let url: string = "";
    if (window.location.href.includes("localhost:3000")) {
      url = `http://localhost:3000/recipe/view/${recipe!.id}`;
    } else {
      url = `https://recipiece.org/recipe/view/${recipe!.id}`;
    }

    if ("navigator" in window) {
      const data = {
        title: recipe!.name,
        text: `Here's a recipe for ${recipe!.name}. Enjoy!`,
        url: url,
      };

      if (navigator.share) {
        try {
          await navigator.share(data);
        } catch {
          // noop
        }
      } else {
        // sometimes we cannot share cause the api's just not there
        // so copy the url to the clipboard and inform the user
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: `A link to this recipe was copied to your clipboard: ${url}`,
        });
      }
    }
  }, [recipe, toast]);

  const onForkRecipe = useCallback(async () => {
    try {
      const forkedRecipe = await forkRecipe({ original_recipe_id: recipe!.id });
      navigate(`/recipe/view/${forkedRecipe.data.id}`);
    } catch {
      // noop
    }
  }, [recipe, forkRecipe, navigate]);

  return (
    <DropdownMenuContent>
      {canFork && (
        <DropdownMenuItem onClick={onForkRecipe}>
          <Utensils /> Fork This Recipe
        </DropdownMenuItem>
      )}
      {canEdit && (
        <DropdownMenuItem onClick={() => navigate(`/recipe/edit/${recipe!.id}`)}>
          <Edit /> Edit This Recipe
        </DropdownMenuItem>
      )}
      {(canFork || canEdit) && <DropdownMenuSeparator />}

      {/* add to cookbook */}
      {canAddToCookbook && !isMobile && (
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
      )}
      {canAddToCookbook && isMobile && (
        <DropdownMenuItem onClick={mobileOnAddToCookbook}>
          <Book />
          Add to Cookbook
        </DropdownMenuItem>
      )}
      {/* add to shopping list */}
      {canAddToShoppingList && !isMobile && (
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
      )}
      {canAddToShoppingList && isMobile && (
        <DropdownMenuItem onClick={mobileOnAddToShoppingList}>
          <ShoppingBasket /> Add to Shopping List
        </DropdownMenuItem>
      )}
      {(canAddToShoppingList || canAddToCookbook) && canShare && <DropdownMenuSeparator />}
      {canShare && (
        <DropdownMenuItem onClick={onShareRecipe} disabled={recipe?.private}>
          <Share /> Share Recipe
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      {canRemoveFromCookbook && (
        <DropdownMenuItem onClick={onRemoveRecipeFromCookbook} className="text-destructive">
          <BookMinus /> Remove from Cookbook
        </DropdownMenuItem>
      )}
      {canDelete && (
        <DropdownMenuItem onClick={onDeleteRecipe} className="text-destructive">
          <Trash /> Delete Recipe
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
};
