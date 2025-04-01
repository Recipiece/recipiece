import { Constant } from "@recipiece/constant";
import { CookbookSchema, ListRecipesQuerySchema, RecipeSchema } from "@recipiece/types";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useGetSelfQuery, useListRecipesQuery } from "../../api";
import { Button, Input, LoadingGroup, MembershipAvatar, Shelf, ShelfSpacer, Stack } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface SearchRecipesForCookbookDialogProps extends BaseDialogProps<RecipeSchema> {
  readonly cookbook: CookbookSchema;
}

export const SearchRecipesForCookbookDialog: FC<SearchRecipesForCookbookDialogProps> = ({ onClose, onSubmit, cookbook }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const { data: user } = useGetSelfQuery();

  const defaultFilters: ListRecipesQuerySchema = useMemo(() => {
    const base = {
      page_number: 0,
      page_size: 5,
      cookbook_id: cookbook.id,
      cookbook_attachments_filter: "exclude" as const,
    };

    /**
     * if we don't own the cookbook, we need to ask the api to list
     * only the recipes that are in the scope of memberships pertaining
     * to us and the user.
     */
    if (cookbook.user_id !== user?.id && cookbook.user_kitchen_membership_id) {
      return {
        ...base,
        user_kitchen_membership_ids: [Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER, cookbook.user_kitchen_membership_id.toString()],
      };
    } else {
      return {
        ...base,
      };
    }
  }, [user, cookbook]);

  const {
    data: recipeData,
    isLoading: isLoadingRecipes,
    isFetching: isFetchingRecipes,
  } = useListRecipesQuery(
    {
      ...defaultFilters,
      search: search,
    },
    {
      enabled: !!user && search.trim().length > 0,
    }
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(debouncedSearchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedSearchTerm]);

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
        <ResponsiveDescription>Search for a recipe to add to your cookbook.</ResponsiveDescription>
      </ResponsiveHeader>
      <Stack>
        <Input type="text" value={debouncedSearchTerm} onChange={(event) => setDebouncedSearchTerm(event.target.value)} />
        <LoadingGroup isLoading={isFetchingRecipes || isLoadingRecipes} variant="spinner" className="h-6 w-6">
          {(recipeData?.data || []).map((recipe) => {
            return (
              <Button disabled={isDisabled} key={recipe.id} variant="outline" onClick={() => onRecipeSelected(recipe)}>
                <div className="flex flex-row gap-2 items-center overflow-hidden">
                  <MembershipAvatar entity={recipe} membershipId={recipe.user_kitchen_membership_id} size="small" />
                  {recipe.name}
                </div>
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
