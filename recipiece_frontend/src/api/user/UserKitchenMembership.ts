import {
  ListCookbooksResponseSchema,
  ListMealPlansResponseSchema,
  ListRecipesResponseSchema,
  ListShoppingListsResponseSchema,
  ListUserKitchenMembershipsQuerySchema,
  ListUserKitchenMembershipsResponseSchema,
  UpdateUserKitchenMembershipRequestSchema,
  UserKitchenMembershipSchema,
  YListUserKitchenMembershipsResponseSchema,
  YUserKitchenMembershipSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CookbookQueryKeys } from "../cookbook";
import { MealPlanQueryKeys } from "../mealPlan";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter, oldDataUpdater, RcpQueryKey } from "../QueryKeys";
import { RecipeQueryKeys } from "../recipe";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { ShoppingListQueryKeys } from "../shoppingList";
import { UserQueryKeys } from "./UserQueryKeys";

interface ShareableEntityData {
  readonly user_id: number;
  readonly id: number;
  readonly shares?: { readonly user_kitchen_membership_id: number }[];
}
interface ShareableEntityListData {
  readonly data: ShareableEntityData[];
}

interface ShareEntityData {
  readonly user_kitchen_membership_id: number;
  readonly source_user: {
    readonly id: number;
  };
  readonly destination_user: {
    readonly id: number;
  };
}

interface ShareEntityListData {
  readonly data: ShareEntityData[];
}

const usePurgeSharedQueries = () => {
  const queryClient = useQueryClient();

  const purgeParentEntityList = <OldDataType extends ShareableEntityListData>(
    membership: UserKitchenMembershipSchema,
    queryKey: RcpQueryKey
    // enforceMembershipUser?: "source_user" | "destination_user"
  ) => {
    queryClient.setQueriesData(
      {
        queryKey: queryKey,
      },
      (oldData: OldDataType | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            data: (oldData.data ?? [])
              .map((entry) => {
                // if (enforceMembershipUser === "source_user" && entry.user_id !== membership.source_user.id) {
                //   return undefined;
                // }
                // if (enforceMembershipUser === "destination_user" && entry.user_id !== membership.destination_user.id) {
                //   return undefined;
                // }
                if (entry.shares) {
                  return {
                    ...entry,
                    shares: entry.shares.filter((share) => share.user_kitchen_membership_id !== membership.id),
                  };
                } else {
                  return { ...entry };
                }
              })
              .filter((result) => !!result) as OldDataType["data"],
          };
        }
        return undefined;
      }
    );
  };

  const purgeShareEntitiesList = <OldDataType extends ShareEntityListData>(membership: UserKitchenMembershipSchema, queryKey: RcpQueryKey) => {
    queryClient.setQueriesData(
      {
        queryKey: queryKey,
      },
      (oldData: OldDataType | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            data: (oldData.data ?? []).filter((share) => share.user_kitchen_membership_id !== membership.id),
          };
        }
        return undefined;
      }
    );
  };

  const purgeParentEntity = <OldDataType extends ShareableEntityData>(
    membership: UserKitchenMembershipSchema,
    queryKey: RcpQueryKey
    // enforceMembershipUser?: "source_user" | "destination_user"
  ) => {
    queryClient.setQueriesData(
      {
        queryKey: queryKey,
      },
      (oldData: OldDataType | undefined) => {
        if (oldData) {
          // if (enforceMembershipUser === "source_user" && oldData.user_id !== membership.source_user.id) {
          //   return undefined;
          // }
          // if (enforceMembershipUser === "destination_user" && oldData.user_id !== membership.destination_user.id) {
          //   return undefined;
          // }
          return {
            ...oldData,
            shares: (oldData.shares ?? []).filter((share) => share.user_kitchen_membership_id !== membership.id),
          };
        }
        return undefined;
      }
    );
  };

  const purgeShareEntity = <OldDataType extends ShareEntityData>(membership: UserKitchenMembershipSchema, queryKey: RcpQueryKey) => {
    queryClient.setQueriesData(
      {
        queryKey: queryKey,
      },
      (oldData: OldDataType | undefined) => {
        if (oldData) {
          if (oldData.user_kitchen_membership_id !== membership.id) {
            return { ...oldData };
          }
        }
        return undefined;
      }
    );
  };

  const purgeShoppingLists = (
    membership: UserKitchenMembershipSchema
    // enforceMembershipUser?: "source_user" | "destination_user"
  ) => {
    purgeParentEntityList(
      membership,
      ShoppingListQueryKeys.LIST_SHOPPING_LISTS()
      // enforceMembershipUser
    );
    purgeParentEntity(
      membership,
      ShoppingListQueryKeys.GET_SHOPPING_LIST()
      // enforceMembershipUser
    );
    purgeShareEntitiesList(membership, ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES());
    purgeShareEntity(membership, ShoppingListQueryKeys.GET_SHOPPING_LIST_SHARE());
  };

  const purgeRecipes = (
    membership: UserKitchenMembershipSchema
    // enforceMembershipUser?: "source_user" | "destination_user"
  ) => {
    purgeParentEntityList(
      membership,
      RecipeQueryKeys.LIST_RECIPES()
      // enforceMembershipUser
    );
    purgeParentEntity(
      membership,
      RecipeQueryKeys.GET_RECIPE()
      // enforceMembershipUser
    );
  };

  const purgeMealPlans = (
    membership: UserKitchenMembershipSchema
    // enforceMembershipUser?: "source_user" | "destination_user"
  ) => {
    purgeParentEntityList(
      membership,
      MealPlanQueryKeys.LIST_MEAL_PLANS()
      // enforceMembershipUser
    );
    purgeParentEntity(
      membership,
      MealPlanQueryKeys.GET_MEAL_PLAN()
      // enforceMembershipUser
    );
    purgeShareEntitiesList(membership, MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES());
    purgeShareEntity(membership, MealPlanQueryKeys.GET_MEAL_PLAN_SHARE());
  };

  const purgeCookbooks = (
    membership: UserKitchenMembershipSchema
    // enforceMembershipUser?: "source_user" | "destination_user"
  ) => {
    purgeParentEntityList(
      membership,
      CookbookQueryKeys.LIST_COOKBOOKS()
      // enforceMembershipUser
    );
    purgeParentEntity(
      membership,
      CookbookQueryKeys.GET_COOKBOOK()
      // enforceMembershipUser
    );
  };

  return { purgeRecipes, purgeShoppingLists, purgeMealPlans, purgeCookbooks };
};

export const useListUserKitchenMembershipsQuery = (filters?: ListUserKitchenMembershipsQuerySchema, args?: QueryArgs<ListUserKitchenMembershipsResponseSchema>) => {
  const { getter } = useGet();
  const queryClient = useQueryClient();

  const query = async () => {
    const data = await getter<ListUserKitchenMembershipsQuerySchema, ListUserKitchenMembershipsResponseSchema>({
      path: "/user-kitchen-membership/list",
      withAuth: "access_token",
      query: {
        ...(filters ?? { page_number: 0, page_size: 100 }),
      },
    });
    return YListUserKitchenMembershipsResponseSchema.cast(data.data);
  };

  return useQuery({
    queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(filters),
    queryFn: async () => {
      const results = await query();
      results.data.forEach((membership) => {
        queryClient.setQueryData(UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(membership.id), membership);
      });
      return results;
    },
    ...(args ?? {}),
  });
};

export const useCreateKitchenMembershipMutation = (args?: MutationArgs<UserKitchenMembershipSchema, { readonly username: string }>) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();

  const mutation = async (body: { readonly username: string }) => {
    const response = await poster<typeof body, UserKitchenMembershipSchema>({
      withAuth: "access_token",
      path: "/user-kitchen-membership",
      body: { ...body },
    });
    return YUserKitchenMembershipSchema.cast(response.data);
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
              status: ["pending"],
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

export const useUpdatePendingUserKitchenMembershipMutation = (args?: MutationArgs<UserKitchenMembershipSchema, UpdateUserKitchenMembershipRequestSchema>) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restArgs } = args ?? {};

  const mutation = useUpdateKitchenMembershipMutation({
    onSuccess: (data, vars, ctx) => {
      // purge the query from the pending queriers that are targeting the user
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
          predicate: generatePartialMatchPredicate(
            UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
              targeting_self: true,
              status: ["pending"],
            })
          ),
        },
        oldDataDeleter(data)
      );

      // set the query into the appropriate cache
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
          predicate: generatePartialMatchPredicate(
            UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
              status: [data.status],
            })
          ),
        },
        oldDataCreator(data)
      );

      if (data.status === "accepted") {
        queryClient.invalidateQueries({
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
          predicate: generatePartialMatchPredicate(RecipeQueryKeys.LIST_RECIPES()),
          refetchType: "inactive",
        });

        queryClient.invalidateQueries({
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
          predicate: generatePartialMatchPredicate(ShoppingListQueryKeys.LIST_SHOPPING_LISTS()),
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
          refetchType: "inactive",
        });

        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLANS()),
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(),
          refetchType: "inactive",
        });

        queryClient.invalidateQueries({
          queryKey: CookbookQueryKeys.LIST_COOKBOOKS(),
          predicate: generatePartialMatchPredicate(CookbookQueryKeys.LIST_COOKBOOKS()),
          refetchType: "inactive",
        });
      }

      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });

  return mutation;
};

export const useUpdatedNonPendingUserKitchenMembershipMutation = (args?: MutationArgs<UserKitchenMembershipSchema, UpdateUserKitchenMembershipRequestSchema>) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restArgs } = args ?? {};

  const mutation = useUpdateKitchenMembershipMutation({
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
          predicate: generatePartialMatchPredicate(
            UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
              targeting_self: true,
              status: ["accepted", "denied"],
            })
          ),
        },
        oldDataUpdater(data)
      );

      if (data.status !== "accepted") {
        queryClient.setQueriesData(
          {
            queryKey: RecipeQueryKeys.LIST_RECIPES(),
            predicate: generatePartialMatchPredicate(RecipeQueryKeys.LIST_RECIPES()),
          },
          (oldData: ListRecipesResponseSchema | undefined) => {
            if (oldData) {
              return {
                ...oldData,
                data: (oldData.data ?? []).filter((r) => r.user_id === data.destination_user.id),
              };
            }
            return undefined;
          }
        );

        queryClient.setQueriesData(
          {
            queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
            predicate: generatePartialMatchPredicate(ShoppingListQueryKeys.LIST_SHOPPING_LISTS()),
          },
          (oldData: ListShoppingListsResponseSchema | undefined) => {
            if (oldData) {
              return {
                ...oldData,
                data: (oldData.data ?? []).filter((r) => r.user_id === data.destination_user.id),
              };
            }
            return undefined;
          }
        );
        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES()),
          refetchType: "inactive",
        });

        queryClient.setQueriesData(
          {
            queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(),
            predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLANS()),
          },
          (oldData: ListMealPlansResponseSchema | undefined) => {
            if (oldData) {
              return {
                ...oldData,
                data: (oldData.data ?? []).filter((r) => r.user_id === data.destination_user.id),
              };
            }
            return undefined;
          }
        );
        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES()),
          refetchType: "inactive",
        });

        queryClient.setQueriesData(
          {
            queryKey: CookbookQueryKeys.LIST_COOKBOOKS(),
            predicate: generatePartialMatchPredicate(CookbookQueryKeys.LIST_COOKBOOKS()),
          },
          (oldData: ListCookbooksResponseSchema | undefined) => {
            if (oldData) {
              return {
                ...oldData,
                data: (oldData.data ?? []).filter((r) => r.user_id === data.destination_user.id),
              };
            }
            return undefined;
          }
        );
      } else {
        queryClient.invalidateQueries({
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
          predicate: generatePartialMatchPredicate(RecipeQueryKeys.LIST_RECIPES()),
          refetchType: "inactive",
        });

        queryClient.invalidateQueries({
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
          predicate: generatePartialMatchPredicate(ShoppingListQueryKeys.LIST_SHOPPING_LISTS()),
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
          predicate: generatePartialMatchPredicate(ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES()),
          refetchType: "inactive",
        });

        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLANS()),
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES()),
          refetchType: "inactive",
        });

        queryClient.invalidateQueries({
          queryKey: CookbookQueryKeys.LIST_COOKBOOKS(),
          predicate: generatePartialMatchPredicate(CookbookQueryKeys.LIST_COOKBOOKS()),
          refetchType: "inactive",
        });
      }

      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });

  return mutation;
};

export const useUpdateKitchenMembershipMutation = (args?: MutationArgs<UserKitchenMembershipSchema, UpdateUserKitchenMembershipRequestSchema>) => {
  const { putter } = usePut();

  const queryClient = useQueryClient();

  const mutation = async (body: UpdateUserKitchenMembershipRequestSchema) => {
    const response = await putter<typeof body, UserKitchenMembershipSchema>({
      path: "/user-kitchen-membership",
      body: {
        ...body,
      },
      withAuth: "access_token",
    });
    return YUserKitchenMembershipSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      queryClient.setQueryData(UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(data.id), data);
      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};

export const useGetUserKitchenMembershipQuery = (id: number, args?: QueryArgs<UserKitchenMembershipSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const response = await getter<never, UserKitchenMembershipSchema>({
      path: `/user-kitchen-membership/${id}`,
      withAuth: "access_token",
    });
    return YUserKitchenMembershipSchema.cast(response.data);
  };

  return useQuery({
    queryKey: UserQueryKeys.GET_USER_KITCHEN_MEMBERSHIP(id),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useDeleteUserKitchenMembershipMutation = (args?: MutationArgs<unknown, UserKitchenMembershipSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();
  const { purgeRecipes, purgeShoppingLists, purgeMealPlans, purgeCookbooks } = usePurgeSharedQueries();

  const mutation = async (membership: UserKitchenMembershipSchema) => {
    return await deleter({
      path: "/user-kitchen-membership",
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
      purgeRecipes(params);
      purgeShoppingLists(params);
      purgeMealPlans(params);
      purgeCookbooks(params);
      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};
