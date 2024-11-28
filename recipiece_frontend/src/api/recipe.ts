import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListRecipeFilters, ListRecipesResponse, Recipe } from "../data";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "./Request";

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
    queryKey: ["recipe", recipeId],
    queryFn: query,
    enabled: args?.disabled !== true,
    retry: 0,
  });
};

export const useListRecipesToAddToCookbook = (search: string, cookbook_id: number, args?: QueryArgs) => {
  const queryKey = ["recipeCookbookSearch", search, cookbook_id];
  const path = `/recipe/list?page_number=0&search=${search}&page_size=5&exclude_cookbook_id=${cookbook_id}`;
  const { getter } = useGet();

  const query = async () => {
    const recipe = await getter<never, ListRecipesResponse>({
      path: path,
      withAuth: "access_token",
    });
    return recipe;
  };

  return useQuery({
    queryKey: queryKey,
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

  const queryKey: any[] = ["recipeList"];
  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.cookbook_id) {
    queryKey.push({ cookbookId: filters.cookbook_id });
    searchParams.append("cookbook_id", filters.cookbook_id.toString());
  }

  queryKey.push({ pageNumber: filters.page_number });

  if (filters.search) {
    queryKey.push({ search: filters.search });
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
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const results = await query();
        results.data.data.forEach((recipe) => {
          queryClient.setQueryData(["recipe", recipe.id], recipe);
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
      queryClient.invalidateQueries({
        queryKey: ["recipeList"],
        refetchType: "all",
      });
      queryClient.setQueryData(["recipe", data.data.id], data.data);
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
      queryClient.invalidateQueries({
        queryKey: ["recipeList"],
        refetchType: "all",
      });
      queryClient.setQueryData(["recipe", data.data.id], data.data);
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
      queryClient.invalidateQueries({
        queryKey: ["recipeList"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["recipe", recipeId],
      });
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
