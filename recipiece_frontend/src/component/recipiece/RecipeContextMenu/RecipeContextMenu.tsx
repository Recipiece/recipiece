import { Book, BookMinus, Edit, Share, ShoppingBasket, Trash, Utensils } from "lucide-react";
import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAttachRecipeToCookbookMutation, useForkRecipeMutation, useListCookbooksQuery, useListShoppingListsQuery, useRemoveRecipeFromCookbookMutation } from "../../../api";
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

  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery(
    {
      page_number: 0,
    },
    {
      disabled: !canAddToShoppingList,
    }
  );

  const { data: cookbooks, isLoading: isLoadingCookbook } = useListCookbooksQuery(
    {
      page_number: 0,
    },
    {
      disabled: !canAddToCookbook,
    }
  );

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
    onFailure: () => {
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
      onClose: () => popDialog("mobileCookbooks"),
      onSubmit: async (cookbook: Cookbook) => {
        try {
          await addRecipeToCookbook({
            recipe_id: recipe.id,
            cookbook_id: cookbook.id,
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
          recipe_id: recipe.id,
          cookbook_id: cookbook.id,
        });
      } catch {}
    },
    [addRecipeToCookbook, recipe]
  );

  const onRemoveRecipeFromCookbook = useCallback(async () => {
    try {
      await removeRecipeFromCookbook({
        recipe_id: recipe.id,
        cookbook_id: cookbookId!,
      });
    } catch {
      // noop
    }
  }, [removeRecipeFromCookbook, cookbookId, recipe]);

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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Book />
            Add to Cookbook
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <LoadingGroup variant="spinner" isLoading={isLoadingCookbook}>
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ShoppingBasket />
            Add to Shopping List
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <LoadingGroup variant="spinner" isLoading={isLoadingShoppingLists}>
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
