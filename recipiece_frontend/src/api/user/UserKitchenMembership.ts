import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListUserKitchenMembershipFilters, ListUserKitchenMembershipsResponse, UserKitchenMembership, UserKitchenMembershipStatus } from "../../data";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { MutationArgs, QueryArgs, useGet, usePost, usePut } from "../Request";
import { UserQueryKeys } from "./UserQueryKeys";

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
    queryKey: UserQueryKeys.LIST_KITCHEN_MEMBERSHIPS(filters),
    queryFn: async () => {
      const results = await query();
      results.data.data.forEach((membership) => {
        queryClient.setQueryData(UserQueryKeys.GET_KITCHEN_MEMBERSHIP(membership.id), membership);
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
      queryClient.setQueryData(UserQueryKeys.GET_KITCHEN_MEMBERSHIP(data.id), data);
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_KITCHEN_MEMBERSHIPS({
            from_self: true,
          }),
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
      queryClient.setQueryData(UserQueryKeys.GET_KITCHEN_MEMBERSHIP(data.id), data);

      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_KITCHEN_MEMBERSHIPS({
            targeting_self: true,
            status: ["pending"],
          }),
        },
        oldDataDeleter(data)
      );
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_KITCHEN_MEMBERSHIPS({
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
    queryKey: UserQueryKeys.GET_KITCHEN_MEMBERSHIP(id),
    queryFn: query,
    ...(args ?? {}),
  });
};
