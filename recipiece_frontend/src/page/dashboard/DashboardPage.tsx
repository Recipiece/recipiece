import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListRecipesQuery } from "../../api";
import { Grid, Input, Label, LoadingSpinner, NotFound, Pager, RecipeCard, Stack } from "../../component";
import { ListRecipeFilters, Recipe } from "../../data";

export const DashboardPage: FC = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const navigate = useNavigate();

  const filters = useMemo(() => {
    let f: ListRecipeFilters = {
      page: page,
    };
    if (debouncedSearchTerm) {
      f = { ...f, search: debouncedSearchTerm };
    }
    return f;
  }, [page, debouncedSearchTerm]);

  const { data: recipeData, isLoading: isLoadingRecipes } = useListRecipesQuery({
    ...filters,
  });

  const recipes = useMemo(() => {
    return recipeData?.data || [];
  }, [recipeData]);

  /**
   * Handle debouncing the search term
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const onViewRecipe = useCallback(
    (recipe: Recipe) => {
      navigate(`/recipe/view/${recipe.id}`);
    },
    [navigate]
  );

  const showPager = !isLoadingRecipes && recipes.length > 0;

  const showRecipes = !isLoadingRecipes && recipes.length > 0;

  const showNotFound = !isLoadingRecipes && recipes.length === 0;

  return (
    <Stack>
      <h1 className="text-2xl block text-center md:text-start md:mr-4">Your Recipes</h1>
      <Label className="grow w-full sm:w-auto">
        Search
        <Input onChange={(event) => setSearchTerm(event.target.value)} />
      </Label>
      {showPager && <Pager className="mt-4 mb-4" page={page} hasNextPage={recipeData?.hasNextPage || false} onPage={setPage} />}
      {isLoadingRecipes && <LoadingSpinner />}
      {showNotFound && (
        <NotFound message={!!debouncedSearchTerm ? `No recipes found with a name matching "${debouncedSearchTerm}".` : "You don't have any recipes. Time to get cookin'!"} />
      )}
      {showRecipes && (
        <Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {(recipes || []).map((r) => {
            return (
              <div className="auto-rows-fr" key={r.id}>
                <RecipeCard onView={onViewRecipe} recipe={r} />
              </div>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
};
