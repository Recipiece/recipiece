import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cookbook, ListCookbookFilters, ListCookbooksResponse, ListRecipesResponse, Recipe } from "../../data";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { RecipeQueryKeys } from "../recipe";
import { CookbookQueryKeys } from "./CookbookQueryKeys";

export const useGetCookbookByIdQuery = (cookbookId: number, args?: QueryArgs<Cookbook>) => {
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
    ...(args ?? {}),
  });
};

export const useListCookbooksQuery = (filters: ListCookbookFilters, args?: QueryArgs<ListCookbooksResponse>) => {
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
    return cookbooks.data;
  };

  return useQuery({
    queryKey: CookbookQueryKeys.LIST_COOKBOOK(filters),
    queryFn: async () => {
      const results = await query();
      /**
       * If we're using the exclude containing recipe id filter, don't
       * set the cookbooks from that.
       */
      if (!exclude_containing_recipe_id) {
        results.data.forEach((cookbook) => {
          queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(cookbook.id), cookbook);
        });
      }
      return results;
    },
    ...(args ?? {}),
  });
};

export const useCreateCookbookMutation = (args?: MutationArgs<Cookbook, Partial<Cookbook>>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<Cookbook>) => {
    const response = await poster<Partial<Cookbook>, Cookbook>({
      path: "/cookbook",
      body: data,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(CookbookQueryKeys.LIST_COOKBOOK(), oldDataCreator(data));
      queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(data.id), data);
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useUpdateCookbookMutation = (args?: MutationArgs<Cookbook, Partial<Cookbook>>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<Cookbook>) => {
    const response = await putter<Partial<Cookbook>, Cookbook>({
      path: "/cookbook",
      body: data,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(data.id), data);
      queryClient.setQueryData(CookbookQueryKeys.LIST_COOKBOOK(), oldDataUpdater(data));
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteCookbookMutation = (args?: MutationArgs<{}, Cookbook>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (cookbook: Cookbook) => {
    return await deleter({
      path: "/cookbook",
      id: cookbook.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, vars, ctx) => {
      queryClient.invalidateQueries({
        queryKey: CookbookQueryKeys.GET_COOKBOOK(vars.id),
      });
      queryClient.setQueryData(CookbookQueryKeys.LIST_COOKBOOK(), oldDataDeleter({ id: vars.id }));
      onSuccess?.({}, vars, ctx);
    },
    ...restArgs,
  });
};

export const useAttachRecipeToCookbookMutation = (args?: MutationArgs<void, { readonly recipe: Recipe; readonly cookbook: Cookbook }>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: { readonly recipe: Recipe; readonly cookbook: Cookbook }) => {
    const response = await poster<{ readonly recipe_id: number; readonly cookbook_id: number }, void>({
      path: "/cookbook/recipe/add",
      body: {
        recipe_id: data.recipe.id,
        cookbook_id: data.cookbook.id,
      },
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, params, ctx) => {
      queryClient.invalidateQueries({
        queryKey: RecipeQueryKeys.LIST_RECIPES_AVAILABLE_TO_COOKBOOK(),
        refetchType: "all",
      });
      queryClient.setQueriesData(
        { queryKey: RecipeQueryKeys.LIST_RECIPE({ cookbook_id: params.cookbook.id, cookbook_attachments: "include" }) },
        (oldData: ListRecipesResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: [{ ...params.recipe }, ...oldData.data],
            };
          } else {
            return {
              has_next_page: false,
              page: 0,
              data: [{ ...params.recipe }],
            };
          }
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: CookbookQueryKeys.LIST_COOKBOOK({
            exclude_containing_recipe_id: params.recipe.id,
          }),
        },
        (oldData: ListCookbooksResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: [...(oldData.data ?? []).filter((cookbook) => cookbook.id !== params.cookbook.id)],
            };
          } else {
            return undefined;
          }
        }
      );
      onSuccess?.(undefined, params, ctx);
    },
    ...restArgs,
  });
};

export const useRemoveRecipeFromCookbookMutation = (args?: MutationArgs<{}, { readonly recipe: Recipe; readonly cookbook: Cookbook }>) => {
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

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, params, ctx) => {
      queryClient.invalidateQueries({
        queryKey: RecipeQueryKeys.LIST_RECIPES_AVAILABLE_TO_COOKBOOK(),
        refetchType: "all",
      });
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPE({ cookbook_id: params.cookbook.id, cookbook_attachments: "include" }),
        },
        (oldData: ListRecipesResponse | undefined) => {
          if (oldData) {
            const newVal = {
              ...oldData,
              data: [...(oldData.data ?? []).filter((r) => r.id !== params.recipe.id)],
            };
            return newVal;
          } else {
            return undefined;
          }
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: CookbookQueryKeys.LIST_COOKBOOK({
            exclude_containing_recipe_id: params.recipe.id,
          }),
        },
        (oldData: ListCookbooksResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: [...(oldData.data ?? []), { ...params.cookbook }],
            };
          } else {
            return undefined;
          }
        }
      );
      onSuccess?.({}, params, ctx);
    },
    ...restArgs,
  });
};
