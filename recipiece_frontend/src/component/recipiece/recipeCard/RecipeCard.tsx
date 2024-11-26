import { FC, useCallback, useContext } from "react";
import { Recipe } from "../../../data";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useToast,
} from "../../shadcn";
import { Book, BookX, MoreVertical, Pencil, ShoppingBasket, SquareArrowOutUpRight, Trash, X } from "lucide-react";
import { Shelf, ShelfSpacer } from "../Layout";
import { useAppendShoppingListItemsMutation, useDeleteRecipeMutation, useListCookbooksQuery, useListShoppingListsQuery, useRemoveRecipeFromCookbookMutation } from "../../../api";
import { useNavigate } from "react-router-dom";
import { DialogContext } from "../../../context";

export interface RecipeCardProps {
  readonly recipe: Recipe;
  readonly cookbookId?: number;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, cookbookId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery({
    page_number: 0,
  });
  const { data: cookbooks, isLoading: isLoadingCookbook } = useListCookbooksQuery({
    page_number: 0,
  });

  const { mutateAsync: appendToShoppingList } = useAppendShoppingListItemsMutation({
    onSuccess: () => {
      toast({
        title: "Shopping List Updated",
        description: "The ingredients were added to you shopping list",
        variant: "default",
      });
    },
    onFailure: () => {
      toast({
        title: "Error Adding Ingredients",
        description: "There was an issue adding the ingredients to the shopping list. Try again later.",
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: deleteRecipe } = useDeleteRecipeMutation({
    onSuccess: () => {
      toast({
        title: "Recipe successfully deleted",
        // description: `The recipe ${recipe.name} was deleted.`,
        variant: "default",
      });
      popDialog("deleteRecipe");
    },
    onFailure: () => {
      toast({
        title: "Cannot delete recipe",
        description: "There was an issue trying to delete your recipe. Try again later.",
        variant: "destructive",
      });
      popDialog("deleteRecipe");
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
    onSuccess: (data) => {
      toast({
        title: "Recipe removed",
        description: "The recipe was removed from the cookbook.",
      });
    },
  });

  const onDelete = useCallback(async () => {
    if (cookbookId) {
      await removeRecipeFromCookbook({
        recipe_id: recipe.id,
        cookbook_id: +cookbookId,
      });
    } else {
      pushDialog("deleteRecipe", {
        onSubmit: onConfirmDeleteRecipe,
        onClose: () => popDialog("deleteRecipe"),
        recipe: recipe,
      });
    }
  }, [cookbookId, recipe]);

  const onConfirmDeleteRecipe = useCallback(async (recipe: Recipe) => {
    await deleteRecipe(recipe.id);
  }, []);

  const onView = useCallback(() => {
    navigate(`/recipe/view/${recipe.id}`);
  }, [recipe]);

  const onEdit = useCallback(() => {
    navigate(`/recipe/edit/${recipe.id}`);
  }, [recipe]);

  const onAddToShoppingList = useCallback(async (listId: number) => {
    await appendToShoppingList({
      shopping_list_id: listId,
      items: recipe.ingredients.map((ing) => {
        return {
          content: ing.name,
        };
      }),
    });
  }, []);

  return (
    <DropdownMenu>
      <Card className="h-full flex flex-col hover:drop-shadow-md">
        <CardHeader className="hover:cursor-pointer">
          <Shelf>
            <CardTitle>{recipe.name}</CardTitle>
            <ShelfSpacer />
            <DropdownMenuTrigger asChild className="invisible md:visible">
              <Button variant="ghost">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* add to cookbook */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Book />
                  <span>Add to cookbook</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {(cookbooks?.data || []).map((cookbook) => {
                      return (
                        <DropdownMenuItem key={cookbook.id}>
                          {cookbook.name}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {/* add to shopping list */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ShoppingBasket />
                  <span>Add To Shopping List</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {(shoppingLists?.data || []).map((list) => {
                      return (
                        <DropdownMenuItem key={list.id} onClick={() => onAddToShoppingList(list.id)}>
                          {list.name}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </Shelf>
        </CardHeader>
        <CardContent className="grow hover:cursor-pointer">
          <p className="max-h-32 overflow-hidden line-clamp-3">{recipe.description}</p>
        </CardContent>
        <CardFooter>
          <Button variant="link" onClick={onDelete}>
            {!!cookbookId ? <BookX /> : <Trash />}
          </Button>
          <Button variant="link" onClick={onEdit}>
            <Pencil />
          </Button>
          <Button className="ml-auto" variant="link" onClick={onView}>
            <SquareArrowOutUpRight />
          </Button>
        </CardFooter>
      </Card>
    </DropdownMenu>
  );
};
