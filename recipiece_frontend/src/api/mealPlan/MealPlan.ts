import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListMealPlanFilters, ListMealPlanItemsFilters, ListMealPlanItemsResponse, ListMealPlanResponse, MealPlan, MealPlanItem } from "../../data";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { MealPlanQueryKeys } from "./MealPlanQueryKeys";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";

export const useGetMealPlanByIdQuery = (listId: number, args?: QueryArgs) => {
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
    enabled: args?.disabled !== true,
    retry: 0,
  });
};

export const useListMealPlansQuery = (filters: ListMealPlanFilters, args?: QueryArgs) => {
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
    return mealPlans;
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.LIST_MEAL_PLANS(filters),
    queryFn: async () => {
      try {
        const results = await query();
        results.data.data.forEach((mealPlan) => {
          queryClient.setQueryData(["mealPlan", mealPlan.id], mealPlan);
        });
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};

export const useCreateMealPlanMutation = (args?: MutationArgs<MealPlan>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<MealPlan>) => {
    return await poster<Partial<MealPlan>, MealPlan>({
      path: "/meal-plan",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLANS(), oldDataCreator(data.data));
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(data.data.id), data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useUpdateMealPlanMutation = (args?: MutationArgs<MealPlan>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<MealPlan>) => {
    return await putter<Partial<MealPlan>, MealPlan>({
      path: `/meal-plan`,
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLANS(), oldDataUpdater(data.data));
      queryClient.setQueryData(MealPlanQueryKeys.GET_MEAL_PLAN(data.data.id), data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useDeleteMealPlanMutation = (args?: MutationArgs<void>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (mealPlanId: number) => {
    return await deleter({
      path: "/meal-plan",
      id: mealPlanId,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, mealPlanId) => {
      queryClient.invalidateQueries({ queryKey: MealPlanQueryKeys.GET_MEAL_PLAN(mealPlanId) });
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLANS(), oldDataDeleter({ id: mealPlanId }));
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useListItemsForMealPlanQuery = (mealPlanId: number, filters: ListMealPlanItemsFilters, args?: QueryArgs) => {
  const { getter } = useGet();

  const searchParams = new URLSearchParams();

  if (filters.start_date) {
    searchParams.append("start_date", filters.start_date);
  }

  if (filters.end_date) {
    searchParams.append("end_date", filters.end_date);
  }

  const query = async () => {
    const mealPlans = await getter<never, ListMealPlanItemsResponse>({
      path: `/meal-plan/${mealPlanId}/item/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return mealPlans;
  };

  return useQuery({
    queryKey: MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(mealPlanId, filters),
    queryFn: async () => {
      try {
        const results = await query();
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};

export const useCreateMealPlanItemMutation = () => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<MealPlanItem>) => {
    return await poster<Partial<MealPlanItem>, MealPlanItem>({
      path: `/meal-plan/${data.meal_plan_id}/item`,
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.data.meal_plan_id), oldDataCreator(data.data));
    },
  });
};

export const useUpdateMealPlanItemMutation = () => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<MealPlanItem>) => {
    return await putter<Partial<MealPlanItem>, MealPlanItem>({
      path: `/meal-plan/${data.meal_plan_id}/item`,
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(data.data.meal_plan_id), oldDataUpdater(data.data));
    },
  });
};

export const useDeleteMealPlanItemMutation = () => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (args: {
    readonly meal_plan_id: number,
    readonly meal_plan_item_id: number,
  }) => {
    return await deleter({
      path: `/meal-plan/${args.meal_plan_id}/item`,
      id: args.meal_plan_item_id,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, args) => {
      queryClient.setQueryData(MealPlanQueryKeys.LIST_MEAL_PLAN_ITEMS(args.meal_plan_id), oldDataDeleter({ id: args.meal_plan_item_id }));
    },
  });
}
