import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListMealPlanFilters, ListMealPlanItemsFilters, ListMealPlanItemsResponse, ListMealPlanResponse, MealPlan, MealPlanItem } from "../../data";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { MealPlanQueryKeys } from "./MealPlanQueryKeys";

export const useGetMealPlanByIdQuery = (listId: number, args?: QueryArgs<MealPlan>) => {
  const { getter } = useGet();

  const query = async () => {
    const mealPlan = await getter<never, MealPlan>({
      path: `/meal-plan/${listId}`,
      withAuth: "access_token",
    });
    return mealPlan.data;
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.GET_MEAL_PLAN(listId),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListMealPlansQuery = (filters: ListMealPlanFilters, args?: QueryArgs<ListMealPlanResponse>) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.search) {
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const mealPlans = await getter<never, ListMealPlanResponse>({
      path: `/meal-plan/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return mealPlans.data;
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

export const useCreateMealPlanMutation = (args?: MutationArgs<MealPlan, Partial<MealPlan>>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<MealPlan>) => {
    const response = await poster<Partial<MealPlan>, MealPlan>({
      path: "/meal-plan",
      body: data,
      withAuth: "access_token",
    });
    return response.data;
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

export const useUpdateMealPlanMutation = (args?: MutationArgs<MealPlan, Partial<MealPlan>>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<MealPlan>) => {
    const response = await putter<Partial<MealPlan>, MealPlan>({
      path: `/meal-plan`,
      body: data,
      withAuth: "access_token",
    });
    return response.data;
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

export const useDeleteMealPlanMutation = (args?: MutationArgs<{}, MealPlan>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (mealPlan: MealPlan) => {
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

export const useListItemsForMealPlanQuery = (mealPlanId: number, filters: ListMealPlanItemsFilters, args?: QueryArgs<ListMealPlanItemsResponse>) => {
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
    const mealPlans = await getter<never, ListMealPlanItemsResponse>({
      path: `/meal-plan/${mealPlanId}/item/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return mealPlans.data;
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId, filters),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useCreateMealPlanItemMutation = (args?: MutationArgs<MealPlanItem, Partial<MealPlanItem>>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<MealPlanItem>) => {
    const response = await poster<Partial<MealPlanItem>, MealPlanItem>({
      path: `/meal-plan/${data.meal_plan_id}/item`,
      body: data,
      withAuth: "access_token",
    });
    return response.data;
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

export const useUpdateMealPlanItemMutation = (args?: MutationArgs<MealPlanItem, Partial<MealPlanItem>>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<MealPlanItem>) => {
    const response = await putter<Partial<MealPlanItem>, MealPlanItem>({
      path: `/meal-plan/${data.meal_plan_id}/item`,
      body: data,
      withAuth: "access_token",
    });
    return response.data;
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

export const useDeleteMealPlanItemMutation = (args?: MutationArgs<{}, MealPlanItem>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (body: MealPlanItem) => {
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
