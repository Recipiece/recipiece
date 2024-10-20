import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListRecipesQuery } from "../../api";
import {
  Input,
  Label,
  LoadingSpinner,
  Pager,
  RecipeCard
} from "../../component";
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

  const { data: recipeData, isLoading: isLoadingRecipes } = useListRecipesQuery(
    {
      ...filters,
    }
  );

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

  return (
    <div className="p-1 md:p-4">
      <div className="flex flex-col flex-wrap md:flex-row">
        <div className="grow flex flex-col md:flex-row items-center">
          <h1 className="text-2xl block text-center md:text-start md:mr-4">
            Your Recipes
          </h1>
          <Label className="grow w-full sm:w-auto">
            Search
            <Input onChange={(event) => setSearchTerm(event.target.value)} />
          </Label>
        </div>
        {!isLoadingRecipes && recipes.length > 0 && (
          <Pager
            className="mt-4 mb-4"
            page={page}
            hasNextPage={recipeData?.hasNextPage || false}
            onPage={setPage}
          />
        )}
      </div>
      {isLoadingRecipes && (
        <div className="flex flex-row items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoadingRecipes && (
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
          {(recipes || []).map((r) => {
            return <RecipeCard onView={onViewRecipe} key={r.id} recipe={r} />;
          })}
        </div>
      )}
      {!isLoadingRecipes && recipes.length > 0 && (
        <Pager
          className="mt-4 mb-4"
          page={page}
          hasNextPage={recipeData?.hasNextPage || false}
          onPage={setPage}
        />
      )}
    </div>
  );
};
