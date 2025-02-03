import {
  ListMealPlanSharesQuerySchema,
  ListMealPlanSharesResponseSchema,
  ListMealPlansResponseSchema,
  MealPlanSchema,
  MealPlanShareSchema,
  YListMealPlanSharesResponseSchema,
  YMealPlanShareSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost } from "../Request";
import { UserQueryKeys } from "../user";
import { MealPlanQueryKeys } from "./MealPlanQueryKeys";

export const useCreateMealPlanShareMutation = (args?: MutationArgs<MealPlanShareSchema, { readonly meal_plan_id: number; readonly user_kitchen_membership_id: number }>) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();

  const mutation = async (data: { readonly meal_plan_id: number; readonly user_kitchen_membership_id: number }) => {
    const response = await poster<typeof data, MealPlanShareSchema>({
      path: "/meal-plan/share",
      body: data,
      withAuth: "access_token",
    });
    return YMealPlanShareSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data: MealPlanShareSchema, params, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(),
          predicate: generatePartialMatchPredicate(
            MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES({
              user_kitchen_membership_id: params.user_kitchen_membership_id,
            })
          ),
        },
        oldDataCreator(data)
      );
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN_SHARE(data.id), data);

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity: "exclude",
            entity_id: data.meal_plan_id,
            entity_type: "meal_plan",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(),
        },
        (oldData: ListMealPlansResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((list) => {
                if (list.id === params.meal_plan_id) {
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
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(params.meal_plan_id), (oldData: MealPlanSchema | undefined) => {
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

export const useDeleteMealPlanShareMutation = (args?: MutationArgs<unknown, MealPlanShareSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (share: MealPlanShareSchema) => {
    return await deleter({
      path: "/meal-plan/share",
      id: share.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      queryClient.invalidateQueries({
        queryKey: MealPlanQueryKeys.GET_MEAL_PLAN_SHARE(params.id),
      });
      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(),
        },
        oldDataDeleter(params)
      );

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity: "exclude",
            entity_id: params.meal_plan_id,
            entity_type: "meal_plan",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(),
        },
        (oldData: ListMealPlansResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((list) => {
                if (list.id === params.meal_plan_id) {
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
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(params.meal_plan_id), (oldData: MealPlanSchema | undefined) => {
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

export const useListMealPlanSharesQuery = (filters: ListMealPlanSharesQuerySchema, args?: QueryArgs<ListMealPlanSharesResponseSchema>) => {
  const { getter } = useGet();

  const searchParams = filtersToSearchParams(filters);

  const query = async () => {
    const mealPlanShares = await getter<never, ListMealPlanSharesResponseSchema>({
      path: `/meal-plan/share/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListMealPlanSharesResponseSchema.cast(mealPlanShares.data);
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(filters),
    queryFn: query,
    ...(args ?? {}),
  });
};
