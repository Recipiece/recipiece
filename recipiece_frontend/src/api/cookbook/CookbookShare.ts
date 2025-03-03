import {
  ListCookbookSharesQuerySchema,
  ListCookbookSharesResponseSchema,
  ListCookbooksResponseSchema,
  CookbookSchema,
  CookbookShareSchema,
  YListCookbookSharesResponseSchema,
  YCookbookShareSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost } from "../Request";
import { UserQueryKeys } from "../user";
import { CookbookQueryKeys } from "./CookbookQueryKeys";

export const useCreateCookbookShareMutation = (args?: MutationArgs<CookbookShareSchema, { readonly cookbook_id: number; readonly user_kitchen_membership_id: number }>) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();

  const mutation = async (data: { readonly cookbook_id: number; readonly user_kitchen_membership_id: number }) => {
    const response = await poster<typeof data, CookbookShareSchema>({
      path: "/cookbook/share",
      body: data,
      withAuth: "access_token",
    });
    return YCookbookShareSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data: CookbookShareSchema, params, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: CookbookQueryKeys.LIST_COOKBOOK_SHARES(),
          predicate: generatePartialMatchPredicate(
            CookbookQueryKeys.LIST_COOKBOOK_SHARES({
              user_kitchen_membership_id: params.user_kitchen_membership_id,
            })
          ),
        },
        oldDataCreator(data)
      );
      queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK_SHARE(data.id), data);

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity_filter: "exclude",
            entity_id: data.cookbook_id,
            entity_type: "cookbook",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: CookbookQueryKeys.LIST_COOKBOOKS(),
        },
        (oldData: ListCookbooksResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((list) => {
                if (list.id === params.cookbook_id) {
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
      queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(params.cookbook_id), (oldData: CookbookSchema | undefined) => {
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

export const useDeleteCookbookShareMutation = (args?: MutationArgs<unknown, CookbookShareSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (share: CookbookShareSchema) => {
    return await deleter({
      path: "/cookbook/share",
      id: share.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      queryClient.invalidateQueries({
        queryKey: CookbookQueryKeys.GET_COOKBOOK_SHARE(params.id),
      });
      queryClient.setQueriesData(
        {
          queryKey: CookbookQueryKeys.LIST_COOKBOOK_SHARES(),
        },
        oldDataDeleter(params)
      );

      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS(),
        predicate: generatePartialMatchPredicate(
          UserQueryKeys.LIST_USER_KITCHEN_MEMBERSHIPS({
            entity_filter: "exclude",
            entity_id: params.cookbook_id,
            entity_type: "cookbook",
          })
        ),
        refetchType: "all",
      });

      queryClient.setQueriesData(
        {
          queryKey: CookbookQueryKeys.LIST_COOKBOOKS(),
        },
        (oldData: ListCookbooksResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).map((list) => {
                if (list.id === params.cookbook_id) {
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
      queryClient.setQueryData(CookbookQueryKeys.GET_COOKBOOK(params.cookbook_id), (oldData: CookbookSchema | undefined) => {
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

export const useListCookbookSharesQuery = (filters: ListCookbookSharesQuerySchema, args?: QueryArgs<ListCookbookSharesResponseSchema>) => {
  const { getter } = useGet();

  const searchParams = filtersToSearchParams(filters);

  const query = async () => {
    const CookbookShares = await getter<never, ListCookbookSharesResponseSchema>({
      path: `/cookbook/share/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListCookbookSharesResponseSchema.cast(CookbookShares.data);
  };

  return useQuery({
    queryKey: CookbookQueryKeys.LIST_COOKBOOK_SHARES(filters),
    queryFn: query,
    ...(args ?? {}),
  });
};
