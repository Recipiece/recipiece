import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Input, Label, LoadingSpinner, NotFound, Pager, RecipeCard, Stack } from "../../component";
import { CookbookContext } from "../../context";
import { ListRecipeFilters, Recipe } from "../../data";

export const DashboardPage: FC = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { recipeData, isLoading, currentCookbook, setFilters } = useContext(CookbookContext);

  const navigate = useNavigate();

  useEffect(() => {
    let f: ListRecipeFilters = {
      page: page,
    };
    if (debouncedSearchTerm) {
      f = { ...f, search: debouncedSearchTerm };
    }
    setFilters(f);
  }, [page, debouncedSearchTerm]);

  /**
   * If you change the cookbook, clear the search and set the page back to 0
   */
  useEffect(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(0);
  }, [currentCookbook]);

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

  const showPager = !isLoading && recipes.length > 0;

  const showRecipes = !isLoading && recipes.length > 0;

  const showNotFound = !isLoading && recipes.length === 0;

  const notFoundMessage = useMemo(() => {
    if (currentCookbook) {
      if (debouncedSearchTerm) {
        return "There's no recipes matching that search term in this cookbook.";
      } else {
        return "There's no recipes in this cookbook. You can add them from the home page!";
      }
    } else {
      if (debouncedSearchTerm) {
        return "None of your recipes match that search term.";
      } else {
        return "You don't have any recipes yet!";
      }
    }
  }, [currentCookbook, debouncedSearchTerm]);

  return (
    <Stack>
      <h1 className="text-2xl block text-center md:text-start md:mr-4">
        {currentCookbook && <>{currentCookbook.name}</>}
        {!currentCookbook && <>Your Recipes</>}
      </h1>
      {currentCookbook?.description && <p className="text-lg">{currentCookbook.description}</p>}
      <Label className="grow w-full sm:w-auto">
        Search
        <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
      </Label>
      {showPager && <Pager className="mt-4 mb-4" page={page} hasNextPage={recipeData?.hasNextPage || false} onPage={setPage} />}
      {isLoading && <LoadingSpinner />}
      {showNotFound && <NotFound message={notFoundMessage} />}
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
