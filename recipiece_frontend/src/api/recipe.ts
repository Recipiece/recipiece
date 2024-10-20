import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListRecipeFilters, Recipe } from "../data";
import { MutationArgs, QueryArgs, useGet, usePost, usePut } from "./request";

export const useGetRecipeByIdQuery = (recipeId: number, args?: QueryArgs) => {
  const { get } = useGet();

  const query = async () => {
    const recipe = await get<never, Recipe>({
      path: `/recipe/${recipeId}`,
      withAuth: true,
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

export const useListRecipesQuery = (filters: ListRecipeFilters, args?: QueryArgs) => {
  const queryClient = useQueryClient();
  const { get } = useGet();

  const queryKey = ["recipeList", filters.page];
  if (filters.search) {
    queryKey.push(filters.search);
  }

  let path = `/recipe/list?page=${filters.page}`;
  if (filters.search) {
    path += `&search=${filters.search}`;
  }

  const query = async () => {
    const recipe = await get<never, { readonly data: Recipe[]; readonly page: number; readonly hasNextPage: boolean }>({
      path: path,
      withAuth: true,
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
  const { post } = usePost();

  const mutation = async (data: Partial<Recipe>) => {
    return await post<Partial<Recipe>, Recipe>({
      path: "/recipe",
      body: data,
      withAuth: true,
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
  const { put } = usePut();

  const mutation = async (data: Partial<Recipe>) => {
    return await put<Partial<Recipe>, Recipe>({
      path: `/recipe`,
      body: data,
      withAuth: true,
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
