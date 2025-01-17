import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost } from "../Request";
import { ListShoppingListResponse, ListShoppingListSharesFilters, ListShoppingListSharesResponse, ShoppingList, ShoppingListShare } from "../../data";
import { ShoppingListQueryKeys } from "./ShoppingListQueryKeys";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter } from "../QueryKeys";
import { UserQueryKeys } from "../user";

export const useCreateShoppingListShareMutation = (args?: MutationArgs<ShoppingListShare, { readonly shopping_list_id: number; readonly user_kitchen_membership_id: number }>) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();

  const mutation = async (data: { readonly shopping_list_id: number; readonly user_kitchen_membership_id: number }) => {
    const response = await poster<typeof data, ShoppingListShare>({
      path: "/shopping-list/share",
      body: data,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data: ShoppingListShare, params, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
        },
        oldDataCreator(data)
      );
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST_SHARE(data.id), data);

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity: "exclude",
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
        (oldData: ListShoppingListResponse | undefined) => {
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
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST(params.shopping_list_id), (oldData: ShoppingList | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            shares: [...(oldData.shares ?? []), data],
          };
        }
        return undefined;
      });

      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteShoppingListShareMutation = (args?: MutationArgs<{}, ShoppingListShare>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (share: ShoppingListShare) => {
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
            entity: "exclude",
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
        (oldData: ListShoppingListResponse | undefined) => {
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
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST(params.shopping_list_id), (oldData: ShoppingList | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            shares: (oldData.shares ?? []).filter((share) => share.id !== params.id),
          };
        }
        return undefined;
      });

      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};

export const useListShoppingListSharesQuery = (filters: ListShoppingListSharesFilters, args?: QueryArgs<ListShoppingListSharesResponse>) => {
  const { getter } = useGet();

  const searchParams = filtersToSearchParams(filters);

  const query = async () => {
    const shoppingListShares = await getter<never, ListShoppingListSharesResponse>({
      path: `/shopping-list/share/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return shoppingListShares.data;
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
    queryFn: query,
    ...(args ?? {}),
  });
};
