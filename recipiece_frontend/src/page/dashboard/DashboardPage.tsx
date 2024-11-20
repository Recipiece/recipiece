import { Plus } from "lucide-react";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAttachRecipeToCookbookMutation, useDeleteRecipeMutation, useGetCookbookByIdQuery, useListRecipesQuery, useRemoveRecipeFromCookbookMutation } from "../../api";
import { Button, Grid, Input, Label, LoadingGroup, NotFound, Pager, RecipeCard, Shelf, ShelfSpacer, Stack, useToast } from "../../component";
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
      };
    } else {
      return {
        page_number: 0,
        search: "",
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

  const navigate = useNavigate();

  const { data: recipeData, isLoading: isLoadingRecipes, isFetching: isFetchingRecipes } = useListRecipesQuery(filters);
  const { data: cookbook, isLoading: isLoadingCookbook } = useGetCookbookByIdQuery(cookbookId ? +cookbookId : -1, { disabled: !cookbookId });
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
  const { mutateAsync: addRecipeToCookbook } = useAttachRecipeToCookbookMutation({
    onSuccess: () => {
      toast({
        title: "Recipe Added to Cookbook",
        description: "The recipe was added to your cookbook.",
      });
      popDialog("searchRecipes");
    },
    onFailure: () => {
      toast({
        title: "Cannot add recipe to cookbook",
        description: "There was an issue trying to add your recipe to this cookbook. Try again later.",
        variant: "destructive",
      });
      popDialog("searchRecipes");
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

  const recipes = useMemo(() => {
    return recipeData?.data || [];
  }, [recipeData]);

  const onViewRecipe = useCallback(
    (recipe: Recipe) => {
      navigate(`/recipe/view/${recipe.id}`);
    },
    [navigate]
  );

  const onEditRecipe = useCallback((recipe: Recipe) => {
    navigate(`/recipe/edit/${recipe.id}`);
  }, []);

  const onDeleteRecipe = useCallback(
    async (recipe: Recipe) => {
      console.log(cookbookId)
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
    },
    [cookbookId]
  );

  const onConfirmDeleteRecipe = useCallback(async (recipe: Recipe) => {
    await deleteRecipe(recipe.id);
  }, []);

  const onFindRecipe = () => {
    pushDialog("searchRecipes", {
      cookbookId: +cookbookId!,
      onSubmit: onSubmitFindRecipe,
      onClose: () => popDialog("searchRecipes"),
    });
  };

  const onSubmitFindRecipe = useCallback(
    async (recipe: Recipe) => {
      await addRecipeToCookbook({ recipe_id: recipe.id, cookbook_id: +cookbookId! });
    },
    [cookbookId]
  );

  return (
    <Stack>
      {!cookbookId && <h1 className="text-xl">All Your Recipes</h1>}
      {cookbookId && (
        <LoadingGroup className="h-8 w-[250px]" isLoading={isLoadingCookbook}>
          <Shelf>
            <h1 className="text-xl">{cookbook?.name}</h1>
            <ShelfSpacer />
            <Button onClick={onFindRecipe} variant="outline">
              <Plus size={20} className="mr-1" /> Add a recipe
            </Button>
          </Shelf>
        </LoadingGroup>
      )}
      {!cookbookId && <p>See all of your recipes in one place.</p>}
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
                  <RecipeCard onView={onViewRecipe} onEdit={onEditRecipe} onDelete={onDeleteRecipe} recipe={recipe} />
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
