import { FC, useCallback, useEffect, useState } from "react";
import { useListRecipesForMealPlanQuery } from "../../api";
import { Button, Input, LoadingGroup, Shelf, ShelfSpacer, Stack } from "../../component";
import { ListRecipeFilters, Recipe } from "../../data";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export const SearchRecipesForMealPlanDialog: FC<BaseDialogProps<Recipe>> = ({ onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
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
  } = useListRecipesForMealPlanQuery({ search: filters.search!, page_number: 0 }, { enabled: (filters.search || "").length >= 2 });

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
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Find a recipe</ResponsiveTitle>
        <ResponsiveDescription>Search for a recipe by name.</ResponsiveDescription>
      </ResponsiveHeader>
      <Stack>
        <Input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        <LoadingGroup isLoading={isFetchingRecipes || isLoadingRecipes} variant="spinner" className="w-6 h-6">
          {(recipeData?.data || []).map((recipe) => {
            return (
              <Button disabled={isDisabled} key={recipe.id} variant="outline" onClick={() => onRecipeSelected(recipe)}>
                {recipe.name}
              </Button>
            );
          })}
          {!!recipeData && recipeData.data.length === 0 && <p className="text-sm">No recipes found, try searching for something else.</p>}
        </LoadingGroup>
      </Stack>
      <ResponsiveFooter>
        <Shelf>
          <ShelfSpacer />
          <Button disabled={isDisabled} variant="outline" onClick={() => onClose?.()}>
            Cancel
          </Button>
        </Shelf>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
