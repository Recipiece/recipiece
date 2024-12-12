import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cookbook, ListCookbookFilters, Recipe } from "../../data";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { RecipeQueryKeys } from "../recipe";
import { CookbookQueryKeys } from "./CookbookQueryKeys";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";

export const useGetCookbookByIdQuery = (cookbookId: number, args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async () => {
    const recipe = await getter<never, Cookbook>({
      path: `/cookbook/${cookbookId}`,
      withAuth: "access_token",
    });
    return recipe.data;
  };

  return useQuery({
    queryKey: CookbookQueryKeys.GET_COOKBOOK(cookbookId),
    queryFn: query,
    enabled: args?.disabled !== true,
    retry: 0,
  });
};

export const useListCookbooksQuery = (filters: ListCookbookFilters, args?: QueryArgs) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const { page_number, search, exclude_containing_recipe_id } = filters;

  const searchParams = new URLSearchParams();
  searchParams.set("page_number", page_number.toString());

  if (exclude_containing_recipe_id) {
    searchParams.set("exclude_containing_recipe_id", exclude_containing_recipe_id.toString());
  }

  if (search) {
    searchParams.set("search", search);
  }

  const query = async () => {
    const cookbooks = await getter<never, { readonly data: Cookbook[]; readonly page: number; readonly hasNextPage: boolean }>({
      path: `/cookbook/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return cookbooks;
  };

  return useQuery({
    queryKey: CookbookQueryKeys.LIST_COOKBOOK(filters),
    queryFn: async () => {
      try {
        const results = await query();
        /**
         * If we're using the exclude containing recipe id filter, don't
         * set the cookbooks from that.
         */
        if (!exclude_containing_recipe_id) {
          results.data.data.forEach((cookbook) => {
            queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(cookbook.id), cookbook);
          });
        }
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};

export const useCreateCookbookMutation = (args?: MutationArgs<Cookbook>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<Cookbook>) => {
    return await poster<Partial<Cookbook>, Cookbook>({
      path: "/cookbook",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(CookbookQueryKeys.LIST_COOKBOOK(), oldDataCreator(data.data));
      queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(data.data.id), data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useUpdateCookbookMutation = (args?: MutationArgs<Cookbook>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<Cookbook>) => {
    return await putter<Partial<Cookbook>, Cookbook>({
      path: "/cookbook",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(data.data.id), data.data);
      queryClient.setQueryData(CookbookQueryKeys.LIST_COOKBOOK(), oldDataUpdater(data.data));
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useDeleteCookbookMutation = (args?: MutationArgs<void>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (cookbookId: number) => {
    return await deleter({
      path: "/cookbook",
      id: cookbookId,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, cookbookId) => {
      queryClient.invalidateQueries({
        queryKey: CookbookQueryKeys.GET_COOKBOOK(cookbookId),
      });
      queryClient.setQueryData(CookbookQueryKeys.LIST_COOKBOOK(), oldDataDeleter({id: cookbookId}));
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useAttachRecipeToCookbookMutation = (args?: MutationArgs<void>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: { readonly recipe: Recipe; readonly cookbook: Cookbook }) => {
    return await poster<{ readonly recipe_id: number; readonly cookbook_id: number }, void>({
      path: "/cookbook/recipe/add",
      body: {
        recipe_id: data.recipe.id,
        cookbook_id: data.cookbook.id,
      },
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({
        queryKey: RecipeQueryKeys.LIST_RECIPES_AVAILABLE_TO_COOKBOOK(),
        refetchType: "all",
      });
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE({ cookbook_id: params.cookbook.id }), (oldData: { data: Recipe[] }) => {
        if (oldData) {
          return {
            ...oldData,
            data: [{ ...params.recipe }, ...oldData.data],
          };
        } else {
          return undefined;
        }
      });
      queryClient.setQueryData(
        CookbookQueryKeys.LIST_COOKBOOK({
          exclude_containing_recipe_id: params.recipe.id,
        }),
        (oldData: { data: Cookbook[] }) => {
          if (oldData) {
            return {
              ...oldData,
              data: [...oldData.data.filter((cookbook) => cookbook.id !== params.cookbook.id)],
            };
          } else {
            return undefined;
          }
        }
      );
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useRemoveRecipeFromCookbookMutation = (args?: MutationArgs<void>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: { readonly recipe: Recipe; readonly cookbook: Cookbook }) => {
    return await poster<{ readonly recipe_id: number; cookbook_id: number }, void>({
      path: "/cookbook/recipe/remove",
      body: {
        recipe_id: data.recipe.id,
        cookbook_id: data.cookbook.id,
      },
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({
        queryKey: RecipeQueryKeys.LIST_RECIPES_AVAILABLE_TO_COOKBOOK(),
        refetchType: "all",
      });
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPE({ cookbook_id: params.cookbook.id }), (oldData: { data: Recipe[] }) => {
        if (oldData) {
          return {
            ...oldData,
            data: [...oldData.data.filter((r) => r.id !== params.recipe.id)],
          };
        } else {
          return undefined;
        }
      });
      queryClient.setQueryData(
        CookbookQueryKeys.LIST_COOKBOOK({
          exclude_containing_recipe_id: params.recipe.id,
        }),
        (oldData: { data: Cookbook[] }) => {
          if (oldData) {
            return {
              ...oldData,
              data: [...oldData.data, { ...params.cookbook }],
            };
          } else {
            return undefined;
          }
        }
      );
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};
