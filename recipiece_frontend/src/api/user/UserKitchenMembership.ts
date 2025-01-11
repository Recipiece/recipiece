import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ListRecipeSharesResponse,
  ListRecipesResponse,
  ListShoppingListResponse,
  ListShoppingListSharesResponse,
  ListUserKitchenMembershipFilters,
  ListUserKitchenMembershipsResponse,
  Recipe,
  ShoppingList,
  ShoppingListShare,
  UserKitchenMembership,
  UserKitchenMembershipStatus,
} from "../../data";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { UserQueryKeys } from "./UserQueryKeys";
import { ShoppingListQueryKeys } from "../shoppingList";
import { RecipeQueryKeys } from "../recipe";

export const useListUserKitchenMembershipsQuery = (filters?: ListUserKitchenMembershipFilters, args?: QueryArgs<ListUserKitchenMembershipsResponse>) => {
  const { getter } = useGet();
  const queryClient = useQueryClient();

  const query = async () => {
    return await getter<ListUserKitchenMembershipFilters, ListUserKitchenMembershipsResponse>({
      path: "/user/kitchen/membership/list",
      withAuth: "access_token",
      query: {
        ...(filters ?? { page_number: 0 }),
      },
    });
  };

  return useQuery({
    queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(filters),
    queryFn: async () => {
      const results = await query();
      results.data.data.forEach((membership) => {
        queryClient.setQueryData(UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(membership.id), membership);
      });
      return results.data;
    },
    ...(args ?? {}),
  });
};

export const useCreateKitchenMembershipMutation = (args?: MutationArgs<UserKitchenMembership, { readonly username: string }>) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();

  const mutation = async (body: { readonly username: string }) => {
    const response = await poster<typeof body, UserKitchenMembership>({
      withAuth: "access_token",
      path: "/user/kitchen/membership",
      body: { ...body },
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(data.id), data);
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
          predicate: generatePartialMatchPredicate(
            UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
              from_self: true,
            })
          ),
        },
        oldDataCreator(data)
      );
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useUpdateKitchenMembershipMutation = (args?: MutationArgs<UserKitchenMembership, { readonly id: number; readonly status: UserKitchenMembershipStatus }>) => {
  const { putter } = usePut();
  const queryClient = useQueryClient();

  const mutation = async (body: { readonly id: number; readonly status: UserKitchenMembershipStatus }) => {
    const response = await putter<typeof body, UserKitchenMembership>({
      path: "/user/kitchen/membership",
      body: {
        ...body,
      },
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      queryClient.setQueryData(UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(data.id), data);

      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            targeting_self: true,
            status: ["pending"],
          }),
        },
        oldDataDeleter(data)
      );
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            targeting_self: true,
            status: ["accepted", "denied"],
          }),
        },
        oldDataUpdater(data)
      );

      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};

export const useGetUserKitchenMembershipQuery = (id: number, args?: QueryArgs<UserKitchenMembership>) => {
  const { getter } = useGet();

  const query = async () => {
    const response = await getter<never, UserKitchenMembership>({
      path: `/user/kitchen/membership/${id}`,
      withAuth: "access_token",
    });
    return response.data;
  };

  return useQuery({
    queryKey: UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(id),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useDeleteUserKitchenMembershipMutation = (args?: MutationArgs<any, UserKitchenMembership>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (membership: UserKitchenMembership) => {
    return await deleter({
      path: "/user/kitchen/membership",
      id: membership.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      // clear out the entity from the user kitchen membership queries
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        },
        oldDataDeleter(params)
      );
      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(params.id),
      });

      /**
       * We need to clear out the records of the shares from all the associated entities.
       * This means we need to sanitize
       * 1. Shopping Lists
       * 2. Shopping List Shares
       * 3. Recipes
       * 4. Recipe Shares
       */

      // shopping lists
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST(),
        },
        (oldData: ShoppingList | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              shares: (oldData.shares ?? []).filter((share) => share.user_kitchen_membership_id !== params.id),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
        },
        (oldData: ListShoppingListResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((shoppingList) => {
                if (shoppingList.shares) {
                  return {
                    ...shoppingList,
                    shares: shoppingList.shares.filter((share) => share.user_kitchen_membership_id !== params.id),
                  };
                }
                return { ...shoppingList };
              }),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
        },
        (oldData: ListShoppingListSharesResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).filter((share) => share.user_kitchen_membership_id !== params.id),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST_SHARE(),
        },
        (oldData: ShoppingListShare | undefined) => {
          if (oldData) {
            if (oldData.user_kitchen_membership_id !== params.id) {
              return { ...oldData };
            }
          }
          return undefined;
        }
      );

      // recipes
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.GET_RECIPE(),
        },
        (oldData: Recipe | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              shares: (oldData.shares ?? []).filter((share) => share.user_kitchen_membership_id !== params.id),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
        },
        (oldData: ListRecipesResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((recipe) => {
                if (recipe.shares) {
                  return {
                    ...recipe,
                    shares: recipe.shares.filter((share) => share.user_kitchen_membership_id !== params.id),
                  };
                }
                return { ...recipe };
              }),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPE_SHARES(),
        },
        (oldData: ListRecipeSharesResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).filter((share) => share.user_kitchen_membership_id !== params.id),
            };
          }
          return undefined;
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.GET_RECIPE_SHARE(),
        },
        (oldData: ShoppingListShare | undefined) => {
          if (oldData) {
            if (oldData.user_kitchen_membership_id !== params.id) {
              return { ...oldData };
            }
          }
          return undefined;
        }
      );
      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};
