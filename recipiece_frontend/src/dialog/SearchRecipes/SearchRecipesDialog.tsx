import { ListRecipesQuerySchema, RecipeSchema } from "@recipiece/types";
import { FC, useCallback, useEffect, useState } from "react";
import { useListRecipesQuery } from "../../api";
import { Button, Input, LoadingGroup, MembershipAvatar, Shelf, ShelfSpacer, Stack } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export const SearchRecipesDialog: FC<BaseDialogProps<RecipeSchema>> = ({ onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const [filters, setFilters] = useState<ListRecipesQuerySchema>({
    page_number: 0,
    search: "",
  });

  const {
    data: recipeData,
    isLoading: isLoadingRecipes,
    isFetching: isFetchingRecipes,
  } = useListRecipesQuery({ search: filters.search!, page_number: 0, page_size: 5 }, { enabled: (filters.search || "").length >= 2 });

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
    async (recipe: RecipeSchema) => {
      setIsDisabled(true);
      try {
        await Promise.resolve(onSubmit?.(recipe));
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
        <LoadingGroup isLoading={isFetchingRecipes || isLoadingRecipes} variant="spinner" className="h-6 w-6">
          {(recipeData?.data || []).map((recipe) => {
            return (
              <Button disabled={isDisabled} key={recipe.id} variant="outline" onClick={() => onRecipeSelected(recipe)}>
                <MembershipAvatar entity={recipe} membershipId={recipe.user_kitchen_membership_id} size="small" />
                <span className="ml-2">{recipe.name}</span>
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
