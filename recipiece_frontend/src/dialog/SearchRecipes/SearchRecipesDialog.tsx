import { FC, useCallback, useEffect, useState } from "react";
import { useListRecipesToAddToCookbook } from "../../api";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, LoadingGroup, Shelf, ShelfSpacer, Stack } from "../../component";
import { ListRecipeFilters, Recipe } from "../../data";
import { BaseDialogProps } from "../BaseDialogProps";

export interface SearchRecipesDialogProps extends BaseDialogProps<Recipe> {
  readonly cookbookId: number;
}

export const SearchRecipesDialog: FC<SearchRecipesDialogProps> = ({ onClose, onSubmit, cookbookId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const [filters, setFilters] = useState<ListRecipeFilters>({
    page_number: 0,
    search: "",
  });

  const {
    data: recipeData,
    isLoading: isLoadingRecipes,
    isFetching: isFetchingRecipes,
  } = useListRecipesToAddToCookbook(filters.search!, cookbookId, {
    disabled: (filters.search || "").length < 2,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => {
        return {
          ...prev,
          search: searchTerm,
          page_number: 0,
        };
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const onRecipeSelected = useCallback(
    async (recipe: Recipe) => {
      setIsDisabled(true);
      try {
        await Promise.resolve(onSubmit?.(recipe));
      } catch {
      } finally {
        setIsDisabled(false);
      }
    },
    [onSubmit]
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Find a recipe</DialogTitle>
        <DialogDescription>Search for a recipe to add to your cookbook.</DialogDescription>
      </DialogHeader>
      <Stack>
        <Input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        <LoadingGroup isLoading={isFetchingRecipes || isLoadingRecipes} variant="spinner" className="w-6 h-6">
          {(recipeData?.data || []).map((recipe) => {
            return (
              <Button disabled={isDisabled} key={recipe.id} variant="ghost" onClick={() => onRecipeSelected(recipe)}>
                {recipe.name}
              </Button>
            );
          })}
        </LoadingGroup>
      </Stack>
      <DialogFooter>
        <Shelf>
          <ShelfSpacer />
          <Button disabled={isDisabled} variant="outline" onClick={() => onClose?.()}>
            Cancel
          </Button>
        </Shelf>
      </DialogFooter>
    </DialogContent>
  );
};
