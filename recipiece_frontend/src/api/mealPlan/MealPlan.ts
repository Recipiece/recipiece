import {
  ListItemsForMealPlanQuerySchema,
  ListItemsForMealPlanResponseSchema,
  ListMealPlanQuerySchema,
  ListMealPlanResponseSchema,
  MealPlanItemSchema,
  MealPlanSchema,
  YListItemsForMealPlanResponseSchema,
  YListMealPlanResponseSchema,
  YMealPlanItemSchema,
  YMealPlanSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { MealPlanQueryKeys } from "./MealPlanQueryKeys";

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

export const useListMealPlansQuery = (filters: ListMealPlanQuerySchema, args?: QueryArgs<ListMealPlanResponseSchema>) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  // if (filters.search) {
  //   searchParams.append("search", filters.search);
  // }

  const query = async () => {
    const mealPlans = await getter<never, ListMealPlanResponseSchema>({
      path: `/meal-plan/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListMealPlanResponseSchema.cast(mealPlans.data);
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
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLANS(), oldDataCreator(data));
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
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLANS(), oldDataUpdater(data));
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(data.id), data);
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteMealPlanMutation = (args?: MutationArgs<{}, MealPlanSchema>) => {
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
      onSuccess?.(data, mealPlan, ctx);
    },
    ...restArgs,
  });
};

export const useListItemsForMealPlanQuery = (mealPlanId: number, filters: ListItemsForMealPlanQuerySchema, args?: QueryArgs<ListItemsForMealPlanResponseSchema>) => {
  const { getter } = useGet();
  const searchParams = filtersToSearchParams(filters);
  // const searchParams = new URLSearchParams();

  // if (filters.start_date) {
  //   searchParams.append("start_date", filters.start_date);
  // }

  // if (filters.end_date) {
  //   searchParams.append("end_date", filters.end_date);
  // }

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
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.meal_plan_id), oldDataCreator(data));
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
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.meal_plan_id), oldDataUpdater(data));
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteMealPlanItemMutation = (args?: MutationArgs<{}, MealPlanItemSchema>) => {
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
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(vars.meal_plan_id), oldDataDeleter({ id: vars.id }));
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};
