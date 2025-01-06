import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListRecipeFilters, ListRecipeSharesFilters, ListRecipesResponse, Recipe, RecipeShare } from "../../data";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { RecipeQueryKeys } from "./RecipeQueryKeys";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";

export const useGetRecipeByIdQuery = (recipeId: number, args?: QueryArgs) => {
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
    enabled: args?.disabled !== true,
    retry: 0,
  });
};

export const useListRecipesToAddToCookbook = (search: string, cookbook_id: number, args?: QueryArgs) => {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.set("search", search);
  }
  searchParams.set("cookbook_id", cookbook_id.toString());
  searchParams.set("cookbook_attachments", "exclude");
  searchParams.set("page_number", "0");
  searchParams.set("page_size", "5");

  const path = `/recipe/list?${searchParams.toString()}`;
  const { getter } = useGet();

  const query = async () => {
    const recipe = await getter<never, ListRecipesResponse>({
      path: path,
      withAuth: "access_token",
    });
    return recipe;
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES_AVAILABLE_TO_COOKBOOK({ search, cookbook_id }),
    queryFn: async () => {
      try {
        const results = await query();
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};

export const useListRecipesForMealPlanQuery = (filters: ListRecipeFilters, args?: QueryArgs) => {
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.search) {
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const recipe = await getter<never, ListRecipesResponse>({
      path: `/recipe/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return recipe;
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES_FOR_MEAL_PLAN(filters),
    queryFn: async () => {
      try {
        const results = await query();
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};

export const useListRecipesQuery = (filters: ListRecipeFilters, args?: QueryArgs) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.cookbook_id) {
    searchParams.append("cookbook_id", filters.cookbook_id.toString());
  }

  if(filters.cookbook_attachments) {
    searchParams.append("cookbook_attachments", filters.cookbook_attachments);
  }

  if (filters.shared_recipes) {
    searchParams.append("shared_recipes", filters.shared_recipes);
  }

  if (filters.search) {
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const recipe = await getter<never, ListRecipesResponse>({
      path: `/recipe/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return recipe;
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPE(filters),
    queryFn: async () => {
      try {
        const results = await query();
        results.data.data.forEach((recipe) => {
          queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(recipe.id), recipe);
        });
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};

export const useCreateRecipeMutation = (args?: MutationArgs<Recipe>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<Recipe>) => {
    return await poster<Partial<Recipe>, Recipe>({
      path: "/recipe",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE(), oldDataCreator(data.data));
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.data.id), data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useUpdateRecipeMutation = (args?: MutationArgs<Recipe>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<Recipe>) => {
    return await putter<Partial<Recipe>, Recipe>({
      path: `/recipe`,
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE(), oldDataUpdater(data.data));
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.data.id), data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useDeleteRecipeMutation = (args?: MutationArgs<void>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (recipeId: number) => {
    return await deleter({
      path: "/recipe",
      id: recipeId,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, recipeId) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE(), oldDataDeleter({ id: recipeId }));
      queryClient.invalidateQueries({ queryKey: RecipeQueryKeys.GET_RECIPE(recipeId) });
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useParseRecipeFromURLMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();

  const mutation = async (url: string) => {
    return await poster<{ readonly source_url: string }, Recipe>({
      path: "/recipe/parse/url",
      body: {
        source_url: url,
      },
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useForkRecipeMutation = (args?: MutationArgs<Recipe>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (body: { readonly original_recipe_id: number }) => {
    return await poster<typeof body, Recipe>({
      path: "/recipe/fork",
      body: { ...body },
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.data.id), data.data);
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE(), oldDataCreator(data.data));
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useListRecipeSharesQuery = (filters: ListRecipeSharesFilters, args?: QueryArgs) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.from_self) {
    searchParams.set("from_self", "true");
  }
  if (filters.targeting_self) {
    searchParams.set("targeting_self", "true");
  }
  if (filters.user_kitchen_membership_id) {
    searchParams.set("user_kitchen_membership_id", filters.user_kitchen_membership_id.toString());
  }

  const query = async () => {
    const recipe = await getter<never, ListRecipesResponse>({
      path: `/recipe/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return recipe;
  };

  return useQuery({
    queryFn: async () => {
      const response = await query();
      response.data.data.forEach((rs) => {
        queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE_SHARE(rs.id), rs);
      });
      return response.data;
    },
    queryKey: RecipeQueryKeys.LIST_RECIPE_SHARES(filters),
    enabled: args?.disabled !== true,
  });
};

export const useCreateRecipeShareMutation = () => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (body: { readonly user_kitchen_membership_id: number; readonly recipe_id: number }) => {
    return await poster<typeof body, RecipeShare>({
      path: "/recipe/share",
      body: { ...body },
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE_SHARES(), oldDataCreator(data.data));
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE_SHARE(data.data.id), data.data);
    },
  });
};

export const useDeleteRecipeShareMutation = () => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (id: number) => {
    return await deleter({
      path: "/recipe/share/",
      id: id,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, params) => {
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE_SHARES(), oldDataDeleter({ id: params }));
      queryClient.invalidateQueries({ queryKey: RecipeQueryKeys.GET_RECIPE_SHARE(params) });
    },
  });
};
