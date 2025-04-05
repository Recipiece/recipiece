import {
  BulkSetMealPlanItemsRequestSchema,
  BulkSetMealPlanItemsResponseSchema,
  ListItemsForMealPlanQuerySchema,
  ListItemsForMealPlanResponseSchema,
  ListMealPlansQuerySchema,
  ListMealPlansResponseSchema,
  MealPlanConfigurationSchema,
  MealPlanItemSchema,
  MealPlanSchema,
  YBulkSetMealPlanItemsRequestSchema,
  YBulkSetMealPlanItemsResponseSchema,
  YListItemsForMealPlanResponseSchema,
  YListMealPlansResponseSchema,
  YMealPlanConfigurationSchema,
  YMealPlanItemSchema,
  YMealPlanSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { MealPlanQueryKeys } from "./MealPlanQueryKeys";

export const useSetMealPlanConfigurationMutation = (
  args?: MutationArgs<MealPlanConfigurationSchema, { readonly mealPlanId: number; readonly configuration: MealPlanConfigurationSchema }>
) => {
  const { putter } = usePut();
  const queryClient = useQueryClient();

  const mutation = async (body: { mealPlanId: number; configuration: MealPlanConfigurationSchema }) => {
    const response = await putter({
      path: `/meal-plan/${body.mealPlanId}/configuration`,
      withAuth: "access_token",
      body: { ...body.configuration },
    });
    return YMealPlanConfigurationSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(vars.mealPlanId), (oldData: MealPlanSchema) => {
        if (oldData) {
          return {
            ...oldData,
            configuration: { ...data },
          };
        }
        return undefined;
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
              data: (oldData.data ?? []).map((mealPlan) => {
                if (mealPlan.id === vars.mealPlanId) {
                  return { ...mealPlan, configuration: { ...data } };
                }
                return { ...mealPlan };
              }),
            };
          }
          return undefined;
        }
      );
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useGetMealPlanByIdQuery = (listId: number, args?: QueryArgs<MealPlanSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const mealPlan = await getter<never, MealPlanSchema>({
      path: `/meal-plan/${listId}`,
      withAuth: "access_token",
    });
    return YMealPlanSchema.cast(mealPlan.data);
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.GET_MEAL_PLAN(listId),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListMealPlansQuery = (filters: ListMealPlansQuerySchema, args?: QueryArgs<ListMealPlansResponseSchema>) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  const query = async () => {
    const mealPlans = await getter<never, ListMealPlansResponseSchema>({
      path: `/meal-plan/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListMealPlansResponseSchema.cast(mealPlans.data);
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(filters),
    queryFn: async () => {
      const results = await query();
      results.data.forEach((mealPlan) => {
        queryClient.setQueryData(["mealPlan", mealPlan.id], mealPlan);
      });
      return results;
    },
    ...(args ?? {}),
  });
};

export const useCreateMealPlanMutation = (args?: MutationArgs<MealPlanSchema, Partial<MealPlanSchema>>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<MealPlanSchema>) => {
    const response = await poster<Partial<MealPlanSchema>, MealPlanSchema>({
      path: "/meal-plan",
      body: data,
      withAuth: "access_token",
    });
    return YMealPlanSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(),
        },
        oldDataCreator(data)
      );
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(data.id), data);
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useUpdateMealPlanMutation = (args?: MutationArgs<MealPlanSchema, Partial<MealPlanSchema>>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<MealPlanSchema>) => {
    const response = await putter<Partial<MealPlanSchema>, MealPlanSchema>({
      path: `/meal-plan`,
      body: data,
      withAuth: "access_token",
    });
    return YMealPlanSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(),
        },
        oldDataUpdater(data)
      );
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(data.id), data);
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteMealPlanMutation = (args?: MutationArgs<unknown, MealPlanSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (mealPlan: MealPlanSchema) => {
    return await deleter({
      path: "/meal-plan",
      id: mealPlan.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, mealPlan, ctx) => {
      queryClient.invalidateQueries({ queryKey: MealPlanQueryKeys.GET_MEAL_PLAN(mealPlan.id) });
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLANS(), oldDataDeleter({ id: mealPlan.id }));
      (mealPlan.shares ?? []).forEach((mealPlanShare) => {
        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES(),
          predicate: generatePartialMatchPredicate(
            MealPlanQueryKeys.LIST_MEAL_PLAN_SHARES({
              user_kitchen_membership_id: mealPlanShare.user_kitchen_membership_id,
            })
          ),
        });
        queryClient.invalidateQueries({
          queryKey: MealPlanQueryKeys.GET_MEAL_PLAN_SHARE(mealPlanShare.id),
        });
      });

      onSuccess?.(data, mealPlan, ctx);
    },
    ...restArgs,
  });
};

export const useListMealPlanItemsQuery = (mealPlanId: number, filters: ListItemsForMealPlanQuerySchema, args?: QueryArgs<ListItemsForMealPlanResponseSchema>) => {
  const { getter } = useGet();
  const searchParams = filtersToSearchParams(filters);

  const query = async () => {
    const mealPlans = await getter<never, ListItemsForMealPlanResponseSchema>({
      path: `/meal-plan/${mealPlanId}/item/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListItemsForMealPlanResponseSchema.cast(mealPlans.data);
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId, filters),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useBulkSetMealPlanItemsMutation = (args?: MutationArgs<BulkSetMealPlanItemsResponseSchema, { mealPlanId: number } & BulkSetMealPlanItemsRequestSchema>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: { mealPlanId: number } & BulkSetMealPlanItemsRequestSchema) => {
    const { mealPlanId, ...restRequest } = data;
    const response = await poster<BulkSetMealPlanItemsRequestSchema, BulkSetMealPlanItemsResponseSchema>({
      path: `/meal-plan/${mealPlanId}/item/bulk-set`,
      withAuth: "access_token",
      body: YBulkSetMealPlanItemsRequestSchema.cast({ ...restRequest }),
    });
    return YBulkSetMealPlanItemsResponseSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, variables, context) => {
      const { created, updated } = data;
      const { delete: deleted, mealPlanId } = variables;

      deleted.forEach((deletedItem) => {
        queryClient.setQueriesData(
          {
            queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId),
            predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId)),
          },
          oldDataDeleter(deletedItem)
        );
      });
      updated.forEach((updatedItem) => {
        queryClient.setQueriesData(
          {
            queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId),
            predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId)),
          },
          oldDataUpdater(updatedItem)
        );
      });
      created.forEach((createdItem) => {
        queryClient.setQueriesData(
          {
            queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId),
            predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId)),
          },
          oldDataCreator(createdItem)
        );
      });

      onSuccess?.(data, variables, context);
    },
    ...restArgs,
  });
};

export const useCreateMealPlanItemMutation = (args?: MutationArgs<MealPlanItemSchema, Partial<MealPlanItemSchema>>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<MealPlanItemSchema>) => {
    const response = await poster<Partial<MealPlanItemSchema>, MealPlanItemSchema>({
      path: `/meal-plan/${data.meal_plan_id}/item`,
      body: data,
      withAuth: "access_token",
    });
    return YMealPlanItemSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.meal_plan_id),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.meal_plan_id)),
        },
        oldDataCreator(data)
      );
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useUpdateMealPlanItemMutation = (args?: MutationArgs<MealPlanItemSchema, Partial<MealPlanItemSchema>>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<MealPlanItemSchema>) => {
    const response = await putter<Partial<MealPlanItemSchema>, MealPlanItemSchema>({
      path: `/meal-plan/${data.meal_plan_id}/item`,
      body: data,
      withAuth: "access_token",
    });
    return YMealPlanItemSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.meal_plan_id),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.meal_plan_id)),
        },
        oldDataUpdater(data)
      );
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteMealPlanItemMutation = (args?: MutationArgs<unknown, MealPlanItemSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (body: MealPlanItemSchema) => {
    return await deleter({
      path: `/meal-plan/${body.meal_plan_id}/item`,
      id: body.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(vars.meal_plan_id),
          predicate: generatePartialMatchPredicate(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(vars.meal_plan_id)),
        },
        oldDataDeleter({ id: vars.id })
      );
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};
