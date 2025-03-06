import {
  ListShoppingListSharesQuerySchema,
  ListShoppingListSharesResponseSchema,
  ListShoppingListsResponseSchema,
  ShoppingListSchema,
  ShoppingListShareSchema,
  YListShoppingListSharesResponseSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost } from "../Request";
import { UserQueryKeys } from "../user";
import { ShoppingListQueryKeys } from "./ShoppingListQueryKeys";

export const useCreateShoppingListShareMutation = (
  args?: MutationArgs<
    ShoppingListShareSchema,
    { readonly shopping_list_id: number; readonly user_kitchen_membership_id: number }
  >
) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();

  const mutation = async (data: { readonly shopping_list_id: number; readonly user_kitchen_membership_id: number }) => {
    const response = await poster<typeof data, ShoppingListShareSchema>({
      path: "/shopping-list/share",
      body: data,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data: ShoppingListShareSchema, params, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
          predicate: generatePartialMatchPredicate(
            ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES({
              user_kitchen_membership_id: params.user_kitchen_membership_id,
            })
          ),
        },
        oldDataCreator(data)
      );
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST_SHARE(data.id), data);

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity_filter: "exclude",
            entity_id: data.shopping_list_id,
            entity_type: "shopping_list",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
        },
        (oldData: ListShoppingListsResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((list) => {
                if (list.id === params.shopping_list_id) {
                  return {
                    ...list,
                    shares: [...(list.shares ?? []), data],
                  };
                } else {
                  return { ...list };
                }
              }),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueryData(
        ShoppingListQueryKeys.GET_SHOPPING_LIST(params.shopping_list_id),
        (oldData: ShoppingListSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              shares: [...(oldData.shares ?? []), data],
            };
          }
          return undefined;
        }
      );

      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteShoppingListShareMutation = (args?: MutationArgs<unknown, ShoppingListShareSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (share: ShoppingListShareSchema) => {
    return await deleter({
      path: "/shopping-list/share",
      id: share.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      queryClient.invalidateQueries({
        queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST_SHARE(params.id),
      });
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
        },
        oldDataDeleter(params)
      );

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity_filter: "exclude",
            entity_id: params.shopping_list_id,
            entity_type: "shopping_list",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
        },
        (oldData: ListShoppingListsResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((list) => {
                if (list.id === params.shopping_list_id) {
                  return {
                    ...list,
                    shares: (list.shares ?? []).filter((share) => share.id !== params.id),
                  };
                } else {
                  return { ...list };
                }
              }),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueryData(
        ShoppingListQueryKeys.GET_SHOPPING_LIST(params.shopping_list_id),
        (oldData: ShoppingListSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              shares: (oldData.shares ?? []).filter((share) => share.id !== params.id),
            };
          }
          return undefined;
        }
      );

      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};

export const useListShoppingListSharesQuery = (
  filters: ListShoppingListSharesQuerySchema,
  args?: QueryArgs<ListShoppingListSharesResponseSchema>
) => {
  const { getter } = useGet();

  const searchParams = filtersToSearchParams(filters);

  const query = async () => {
    const shoppingListShares = await getter<never, ListShoppingListSharesResponseSchema>({
      path: `/shopping-list/share/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListShoppingListSharesResponseSchema.cast(shoppingListShares.data);
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(filters),
    queryFn: query,
    ...(args ?? {}),
  });
};
