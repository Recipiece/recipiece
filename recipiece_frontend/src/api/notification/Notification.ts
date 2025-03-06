import {
  ListNotificationsQuerySchema,
  ListNotificationsResponseSchema,
  NotificationSchema,
  SetNotificationStatusRequestSchema,
  YListNotificationsResponseSchema,
  YNotificationSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePut } from "../Request";
import { NotificationQueryKeys } from "./NotificationQueryKeys";

export const useGetNotificationQuery = (notificationId: number, args?: QueryArgs<NotificationSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const response = await getter({
      path: `/notification/${notificationId}`,
      withAuth: "access_token",
    });
    return YNotificationSchema.cast(response.data);
  };

  return useQuery({
    queryKey: NotificationQueryKeys.GET_NOTIFICATION(notificationId),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListNotificationsQuery = (
  filters?: Partial<ListNotificationsQuerySchema>,
  args?: QueryArgs<ListNotificationsResponseSchema>
) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const query = async () => {
    const searchParams = filtersToSearchParams(filters ?? {});
    const response = await getter({
      path: "/notification/list",
      query: searchParams,
      withAuth: "access_token",
    });
    return YListNotificationsResponseSchema.cast(response.data);
  };

  return useQuery({
    queryKey: NotificationQueryKeys.LIST_NOTIFICATIONS(filters),
    queryFn: async () => {
      const data = await query();
      data.data.forEach((notif) => {
        queryClient.setQueryData(NotificationQueryKeys.GET_NOTIFICATION(notif.id), notif);
      });
      return data;
    },
    ...(args ?? {}),
  });
};

export const useSetNotificationStatusMutation = (
  args?: MutationArgs<NotificationSchema, SetNotificationStatusRequestSchema>
) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (body: SetNotificationStatusRequestSchema) => {
    const response = await putter({
      path: "/notification",
      body: { ...body },
      withAuth: "access_token",
    });
    return YNotificationSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(NotificationQueryKeys.GET_NOTIFICATION(vars.id), data);
      queryClient.setQueriesData(
        {
          queryKey: NotificationQueryKeys.LIST_NOTIFICATIONS(),
          predicate: generatePartialMatchPredicate(NotificationQueryKeys.LIST_NOTIFICATIONS()),
        },
        oldDataUpdater(data)
      );
      onSuccess?.(data, vars, ctx);
    },
    ...(restArgs ?? {}),
  });
};

export const useDeleteNotificationMutation = (args?: MutationArgs<unknown, NotificationSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (body: NotificationSchema) => {
    const response = await deleter({
      path: "/notification",
      id: body.id,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: NotificationQueryKeys.GET_NOTIFICATION(vars.id) });
      queryClient.setQueriesData(
        {
          queryKey: NotificationQueryKeys.LIST_NOTIFICATIONS(),
          predicate: generatePartialMatchPredicate(NotificationQueryKeys.LIST_NOTIFICATIONS()),
        },
        oldDataDeleter(vars)
      );
      onSuccess?.(data, vars, ctx);
    },
    ...(restArgs ?? {}),
  });
};
