import { Plus } from "lucide-react";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAttachRecipeToCookbookMutation, useGetCookbookByIdQuery, useListRecipesQuery } from "../../api";
import { Button, Grid, H2, Input, Label, LoadingGroup, NotFound, Pager, RecipeCard, Shelf, ShelfSpacer, Stack, useToast } from "../../component";
import { DialogContext } from "../../context";
import { ListRecipeFilters, Recipe } from "../../data";

export const DashboardPage: FC = () => {
  const { cookbookId } = useParams();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const defaultFilters: ListRecipeFilters = useMemo(() => {
    if (cookbookId) {
      return {
        page_number: 0,
        cookbook_id: +cookbookId,
        search: "",
        shared_recipes: "include",
        cookbook_attachments: "include",
      };
    } else {
      return {
        page_number: 0,
        search: "",
        shared_recipes: "include",
      };
    }
  }, [cookbookId]);

  const [filters, setFilters] = useState<ListRecipeFilters>({ ...defaultFilters });
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  /**
   * Handle debouncing the search term
   */
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

  /**
   * Handle changing to a cookbook view
   */
  useEffect(() => {
    setFilters({ ...defaultFilters });
  }, [cookbookId, defaultFilters]);

  const onPageChange = useCallback((newPage: number) => {
    setFilters((prev) => {
      return {
        ...prev,
        page_number: newPage,
      };
    });
  }, []);

  const { data: recipeData, isLoading: isLoadingRecipes, isFetching: isFetchingRecipes } = useListRecipesQuery(filters);
  const { data: cookbook, isLoading: isLoadingCookbook } = useGetCookbookByIdQuery(cookbookId ? +cookbookId : -1, { enabled: !!cookbookId });
  const { mutateAsync: addRecipeToCookbook } = useAttachRecipeToCookbookMutation();

  const recipes = useMemo(() => {
    return recipeData?.data || [];
  }, [recipeData]);

  const onFindRecipe = useCallback(() => {
    pushDialog("searchRecipesForCookbook", {
      cookbookId: +cookbookId!,
      onSubmit: async (recipe: Recipe) => {
        try {
          await addRecipeToCookbook({ recipe: recipe, cookbook: cookbook! });
          toast({
            title: "Recipe Added to Cookbook",
            description: "The recipe was added to your cookbook.",
          });
        } catch {
          toast({
            title: "Cannot add recipe to cookbook",
            description: "There was an issue trying to add your recipe to this cookbook. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("searchRecipesForCookbook");
        }
      },
      onClose: () => popDialog("searchRecipesForCookbook"),
    });
  }, [addRecipeToCookbook, cookbook, cookbookId, popDialog, pushDialog, toast]);

  return (
    <Stack>
      {!cookbookId && <H2>Your Recipes</H2>}
      {cookbookId && (
        <LoadingGroup className="h-8 w-[250px]" isLoading={isLoadingCookbook}>
          <Shelf>
            <H2>{cookbook?.name}</H2>
            <ShelfSpacer />
            <Button onClick={onFindRecipe} variant="outline">
              <Plus size={20} className="mr-1" /> Add a recipe
            </Button>
          </Shelf>
        </LoadingGroup>
      )}
      {cookbookId && (
        <LoadingGroup isLoading={isLoadingCookbook} className="h-4">
          <p>{cookbook?.description}</p>
        </LoadingGroup>
      )}
      <Label className="grow w-full sm:w-auto">
        Search
        <Input disabled={isLoadingRecipes || isFetchingRecipes} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
      </Label>
      <LoadingGroup variant="spinner" isLoading={isLoadingRecipes || isFetchingRecipes || (!!cookbookId && isLoadingCookbook)}>
        <Stack>
          {!isLoadingRecipes && recipes.length === 0 && (
            <>
              <NotFound message="No recipes to be had, time to get cooking!" />
              {cookbookId && (
                <div className="text-center">
                  <Button onClick={onFindRecipe} variant="outline">
                    <Plus size={20} className="mr-1" /> Add a recipe
                  </Button>
                </div>
              )}
            </>
          )}
          <Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(recipes || []).map((recipe) => {
              return (
                <div className="auto-rows-fr" key={recipe.id}>
                  <RecipeCard recipe={recipe} cookbookId={cookbookId ? +cookbookId : undefined} />
                </div>
              );
            })}
          </Grid>
          {recipes.length > 0 && <Pager page={filters.page_number} onPage={onPageChange} hasNextPage={!!recipeData?.has_next_page} />}
        </Stack>
      </LoadingGroup>
    </Stack>
  );
};
