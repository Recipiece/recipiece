import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListRecipeFilters, ListRecipesResponse, Recipe } from "../../data";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { RecipeQueryKeys } from "./RecipeQueryKeys";

export const useGetRecipeByIdQuery = (recipeId: number, args?: QueryArgs<Recipe>) => {
  const { getter } = useGet();

  const query = async () => {
    const recipe = await getter<never, Recipe>({
      path: `/recipe/${recipeId}`,
      withAuth: "access_token",
    });
    return recipe.data;
  };

  return useQuery({
    queryKey: RecipeQueryKeys.GET_RECIPE(recipeId),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListRecipesToAddToCookbook = (search: string, cookbook_id: number, args?: QueryArgs<ListRecipesResponse>) => {
  // const searchParams = new URLSearchParams();
  // if (search) {
  //   searchParams.set("search", search);
  // }
  // searchParams.set("cookbook_id", cookbook_id.toString());
  // searchParams.set("cookbook_attachments", "exclude");
  // searchParams.set("page_number", "0");
  // searchParams.set("page_size", "5");
  let filters: ListRecipeFilters = {
    cookbook_id: cookbook_id,
    cookbook_attachments: "exclude",
    page_number: 0,
    page_size: 5,
  };
  if (search) {
    filters = { ...filters, search };
  }
  const searchParams = filtersToSearchParams(filters);

  const path = `/recipe/list?${searchParams.toString()}`;
  const { getter } = useGet();

  const query = async () => {
    const recipe = await getter<never, ListRecipesResponse>({
      path: path,
      withAuth: "access_token",
    });
    return recipe.data;
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES_AVAILABLE_TO_COOKBOOK({ search, cookbook_id }),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListRecipesForMealPlanQuery = (filters: ListRecipeFilters, args?: QueryArgs<ListRecipesResponse>) => {
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.search) {
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const recipes = await getter<never, ListRecipesResponse>({
      path: `/recipe/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return recipes.data;
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES_FOR_MEAL_PLAN(filters),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListRecipesQuery = (filters: ListRecipeFilters, args?: QueryArgs<ListRecipesResponse>) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.cookbook_id) {
    searchParams.append("cookbook_id", filters.cookbook_id.toString());
  }

  if (filters.cookbook_attachments) {
    searchParams.append("cookbook_attachments", filters.cookbook_attachments);
  }

  if (filters.shared_recipes) {
    searchParams.append("shared_recipes", filters.shared_recipes);
  }

  if (filters.search) {
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const recipes = await getter<never, ListRecipesResponse>({
      path: `/recipe/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return recipes.data;
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES(filters),
    queryFn: async () => {
      const results = await query();
      results.data.forEach((recipe) => {
        queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(recipe.id), recipe);
      });
      return results;
    },
    ...(args ?? {}),
  });
};

export const useCreateRecipeMutation = (args?: MutationArgs<Recipe, Partial<Recipe>>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<Recipe>) => {
    const response = await poster<Partial<Recipe>, Recipe>({
      path: "/recipe",
      body: data,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPES(), oldDataCreator(data));
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.id), data);
      onSuccess?.(data, variables, context);
    },
    ...restArgs,
  });
};

export const useUpdateRecipeMutation = (args?: MutationArgs<Recipe, Partial<Recipe>>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<Recipe>) => {
    const response = await putter<Partial<Recipe>, Recipe>({
      path: `/recipe`,
      body: data,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPES(), oldDataUpdater(data));
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.id), data);
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteRecipeMutation = (args?: MutationArgs<{}, Recipe>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (recipe: Recipe) => {
    const response = await deleter({
      path: "/recipe",
      id: recipe.id,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, recipe, ctx) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPES(), oldDataDeleter({ id: recipe.id }));
      queryClient.invalidateQueries({ queryKey: RecipeQueryKeys.GET_RECIPE(recipe.id) });
      onSuccess?.(data, recipe, ctx);
    },
    ...restArgs,
  });
};

export const useParseRecipeFromURLMutation = (args?: MutationArgs<Recipe, string>) => {
  const { poster } = usePost();

  const mutation = async (url: string) => {
    const response = await poster<{ readonly source_url: string }, Recipe>({
      path: "/recipe/parse/url",
      body: {
        source_url: url,
      },
      withAuth: "access_token",
    });
    return response.data;
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useForkRecipeMutation = (args?: MutationArgs<Recipe, { readonly original_recipe_id: number }>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (body: { readonly original_recipe_id: number }) => {
    const response = await poster<typeof body, Recipe>({
      path: "/recipe/fork",
      body: { ...body },
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.id), data);
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPES(), oldDataCreator(data));
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};
