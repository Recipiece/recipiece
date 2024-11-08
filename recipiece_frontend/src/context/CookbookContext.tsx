import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";
import { useListRecipesQuery } from "../api";
import { Cookbook, ListRecipeFilters, ListRecipesResponse } from "../data";
import { AuthContext } from "./AuthContext";

export const CookbookContext = createContext<{
  readonly currentCookbook?: Cookbook;
  readonly setCurrentCookbook: Dispatch<SetStateAction<Cookbook | undefined>>;
  readonly filters: Omit<ListRecipeFilters, "cookbookId">;
  readonly setFilters: Dispatch<SetStateAction<ListRecipeFilters>>;
  readonly recipeData?: ListRecipesResponse;
  readonly isLoading: boolean;
}>({
  currentCookbook: undefined,
  setCurrentCookbook: (_) => {},
  filters: {} as ListRecipeFilters,
  setFilters: (_) => {},
  recipeData: undefined,
  isLoading: true,
});

export const CookbookContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const [currentCookbook, setCurrentCookbook] = useState<Cookbook | undefined>(undefined);
  const [filters, setFilters] = useState<ListRecipeFilters>({
    page: 0,
  });

  const fullFilters = useMemo(() => {
    if (currentCookbook) {
      return { ...filters, cookbookId: currentCookbook.id };
    } else {
      return { ...filters };
    }
  }, [filters, currentCookbook]);

  const {
    data: recipeData,
    isLoading: isLoadingRecipes,
    isFetching: isFetchingRecipes,
  } = useListRecipesQuery(
    {
      ...fullFilters,
    },
    {
      disabled: !authToken,
    }
  );

  return (
    <CookbookContext.Provider
      value={{
        currentCookbook,
        setCurrentCookbook,
        filters,
        setFilters,
        isLoading: isLoadingRecipes || isFetchingRecipes,
        recipeData: recipeData,
      }}
    >
      {children}
    </CookbookContext.Provider>
  );
};
