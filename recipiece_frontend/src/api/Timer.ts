/**
 * These query hooks should be used only in the TimerContext, rather than directly by some component.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListTimerFilters, Timer } from "../data";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "./Request";

export const useGetTimerByIdQuery = (timerId: number, args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async () => {
    const timer = await getter<never, Timer>({
      path: `/timer/${timerId}`,
      withAuth: "access_token",
    });
    return timer.data;
  };

  return useQuery({
    queryKey: ["timer", timerId],
    queryFn: query,
    enabled: args?.disabled !== true,
    retry: 0,
  });
};

export const useListTimersQuery = (filters: ListTimerFilters, args?: QueryArgs) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const queryKey = ["timerList", filters.page_number];
  const path = `/timer/list?page_number=${filters.page_number}`;

  const query = async () => {
    const timers = await getter<never, { readonly data: Timer[]; readonly page: number; readonly hasNextPage: boolean }>({
      path: path,
      withAuth: "access_token",
    });
    return timers;
  };

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const results = await query();
        results.data.data.forEach((timer) => {
          queryClient.setQueryData(["timer", timer.id], timer);
        });
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateTimerMutation = (args?: MutationArgs<Timer>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<Timer>) => {
    return await poster<Partial<Timer>, Timer>({
      path: "/timer",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["timerList"],
        refetchType: "all",
      });
      queryClient.setQueryData(["timer", data.data.id], data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useUpdateTimerMutation = (args?: MutationArgs<Timer>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<Timer>) => {
    return await putter<Partial<Timer>, Timer>({
      path: "/timer",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["timerList"],
        refetchType: "all",
      });
      queryClient.setQueryData(["timer", data.data.id], data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useDeleteTimerMutation = (args?: MutationArgs<void>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (timerId: number) => {
    return await deleter({
      path: "/timer",
      id: timerId,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, timerId) => {
      queryClient.invalidateQueries({
        queryKey: ["timerList"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["timer", timerId],
      });
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};
