import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Recipe } from "../data";
import { MutationArgs, useGet, usePost } from "./request";

export const useGetRecipeByIdQuery = (recipeId: number, enabled = true) => {
  const { get } = useGet();

  const query = async () => {
    const recipe = await get<never, Recipe>({
      path: `/recipe/${recipeId}`,
      withAuth: true,
    });
    return recipe;
  };

  return useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: query,
    enabled: enabled,
  });
};

export const useCreateRecipeMutation = (args?: MutationArgs<Recipe>) => {
  const queryClient = useQueryClient();
  const { post } = usePost();

  const mutation = async (data: Recipe) => {
    return await post<Recipe, Recipe>({
      path: "/recipe",
      body: data,
      withAuth: true,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(["recipe", data.data.id], data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};
