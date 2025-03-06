import {
  ListRecipeSharesQuerySchema,
  ListRecipeSharesResponseSchema,
  ListRecipesResponseSchema,
  RecipeSchema,
  RecipeShareSchema,
  YListRecipeSharesResponseSchema,
  YRecipeShareSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter } from "../QueryKeys";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost } from "../Request";
import { UserQueryKeys } from "../user";
import { RecipeQueryKeys } from "./RecipeQueryKeys";

export const useListRecipeSharesQuery = (
  filters: ListRecipeSharesQuerySchema,
  args?: QueryArgs<ListRecipeSharesResponseSchema>
) => {
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
    const shares = await getter<never, ListRecipeSharesResponseSchema>({
      path: `/recipe/share/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListRecipeSharesResponseSchema.cast(shares.data);
  };

  return useQuery({
    queryFn: async () => {
      const response = await query();
      response.data.forEach((rs) => {
        queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE_SHARE(rs.id), rs);
      });
      return response;
    },
    queryKey: RecipeQueryKeys.LIST_RECIPE_SHARES(filters),
    ...(args ?? {}),
  });
};

export const useCreateRecipeShareMutation = (
  args?: MutationArgs<RecipeShareSchema, { readonly user_kitchen_membership_id: number; readonly recipe_id: number }>
) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (body: { readonly user_kitchen_membership_id: number; readonly recipe_id: number }) => {
    const response = await poster<typeof body, RecipeShareSchema>({
      path: "/recipe/share",
      body: { ...body },
      withAuth: "access_token",
    });
    return YRecipeShareSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      /**
       * When we create a share, we will update the query client's cache of recipe shares
       * and then also update the query client's cache of recipes to append the shares to the list.
       */
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPE_SHARES(),
          predicate: generatePartialMatchPredicate(
            RecipeQueryKeys.LIST_RECIPE_SHARES({
              user_kitchen_membership_id: vars.user_kitchen_membership_id,
            })
          ),
        },
        oldDataCreator(data)
      );

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity_filter: "exclude",
            entity_id: data.recipe_id,
            entity_type: "recipe",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
        },
        (oldData: ListRecipesResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: oldData.data.map((recipe) => {
                if (recipe.id === data.recipe_id) {
                  return {
                    ...recipe,
                    shares: [...(recipe.shares ?? []), data],
                  };
                } else {
                  return { ...recipe };
                }
              }),
            };
          }
          return undefined;
        }
      );

      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE_SHARE(data.id), data);
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.recipe_id), (oldRecipe: RecipeSchema | undefined) => {
        if (oldRecipe) {
          return {
            ...oldRecipe,
            shares: [...(oldRecipe.shares ?? []), data],
          };
        }
        return undefined;
      });

      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteRecipeShareMutation = (args?: MutationArgs<unknown, RecipeShareSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (share: RecipeShareSchema) => {
    return await deleter({
      path: "/recipe/share",
      id: share.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      /**
       * When we delete a share, we need to purge the share from the query client's cache of
       * recipe shares, and also from the affected recipe
       */
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPE_SHARES(),
        },
        oldDataDeleter({ id: params.id })
      );

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity_filter: "exclude",
            entity_id: params.recipe_id,
            entity_type: "recipe",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
        },
        (oldData: ListRecipesResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: oldData.data.map((recipe) => {
                if (recipe.id === params.recipe_id) {
                  return {
                    ...recipe,
                    shares: (recipe.shares ?? []).filter((share) => {
                      return share.id !== params.id;
                    }),
                  };
                } else {
                  return { ...recipe };
                }
              }),
            };
          }
          return undefined;
        }
      );

      queryClient.invalidateQueries({ queryKey: RecipeQueryKeys.GET_RECIPE_SHARE(params.id) });
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(params.recipe_id), (oldData: RecipeSchema | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            shares: (oldData.shares ?? []).filter((share) => {
              return share.id !== params.id;
            }),
          };
        }
        return undefined;
      });

      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};
