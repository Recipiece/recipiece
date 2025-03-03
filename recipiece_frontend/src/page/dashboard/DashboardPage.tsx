import { ListRecipesQuerySchema, RecipeSchema } from "@recipiece/types";
import { Plus } from "lucide-react";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAttachRecipeToCookbookMutation, useGetCookbookByIdQuery, useListRecipesQuery } from "../../api";
import { RecipeSearch, Button, Grid, H2, LoadingGroup, NotFound, Pager, RecipeCard, Shelf, ShelfSpacer, Stack, useToast } from "../../component";
import { DialogContext } from "../../context";
import { DataTestId } from "@recipiece/constant";

export const DashboardPage: FC = () => {
  const { cookbookId } = useParams();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const defaultFilters: ListRecipesQuerySchema = useMemo(() => {
    if (cookbookId) {
      return {
        page_number: 0,
        cookbook_id: +cookbookId,
        search: "",
        shared_recipes_filter: "include",
        cookbook_attachments_filter: "include",
      };
    } else {
      return {
        page_number: 0,
        search: "",
        shared_recipes_filter: "include",
      };
    }
  }, [cookbookId]);

  const [filters, setFilters] = useState<ListRecipesQuerySchema>({ ...defaultFilters });

  const { toast } = useToast();

  const onSearch = async (filters: Partial<ListRecipesQuerySchema>) => {
    setFilters((prev) => {
      return {
        ...prev,
        ...filters,
      };
    });
  };

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
      onSubmit: async (recipe: RecipeSchema) => {
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
      {!cookbookId && <H2 data-testid={DataTestId.DashboardPage.HEADING_TITLE}>Your Recipes</H2>}
      {cookbookId && (
        <LoadingGroup className="h-8 w-[250px]" isLoading={isLoadingCookbook}>
          <Shelf>
            <H2 data-testid={DataTestId.DashboardPage.HEADING_TITLE}>{cookbook?.name}</H2>
            <ShelfSpacer />
            <Button data-testid={DataTestId.DashboardPage.BUTTON_ADD_RECIPE_HEADER} onClick={onFindRecipe} variant="outline">
              <Plus size={20} className="mr-1" /> Add a recipe
            </Button>
          </Shelf>
        </LoadingGroup>
      )}
      {cookbookId && (
        <LoadingGroup isLoading={isLoadingCookbook} className="h-4">
          <p data-testid={DataTestId.DashboardPage.PARAGRAPH_DESCRIPTION}>{cookbook?.description}</p>
        </LoadingGroup>
      )}
      <RecipeSearch
        dataTestId={DataTestId.DashboardPage.RECIPE_SEARCH_BAR}
        isLoading={isLoadingRecipes || isFetchingRecipes || (!!cookbookId && isLoadingCookbook)}
        onSubmit={onSearch}
      />
      <LoadingGroup variant="spinner" isLoading={isLoadingRecipes || isFetchingRecipes || (!!cookbookId && isLoadingCookbook)}>
        <Stack>
          {!isLoadingRecipes && recipes.length === 0 && (
            <>
              <NotFound dataTestId={DataTestId.DashboardPage.NOT_FOUND} message="No recipes to be had, time to get cooking!" />
              {cookbookId && (
                <div className="text-center">
                  <Button data-testid={DataTestId.DashboardPage.BUTTON_ADD_RECIPE_EMPTY} onClick={onFindRecipe} variant="outline">
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
          {recipes.length > 0 && <Pager dataTestId={DataTestId.DashboardPage.PAGER} page={filters.page_number} onPage={onPageChange} hasNextPage={!!recipeData?.has_next_page} />}
        </Stack>
      </LoadingGroup>
    </Stack>
  );
};
