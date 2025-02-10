import { ListUserTagsQuerySchema, ListUserTagsResponseSchema, UserTagSchema, YListUserTagsResponseSchema } from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataDeleter } from "../QueryKeys";
import { MutationArgs, QueryArgs, useDelete, useGet } from "../Request";
import { UserQueryKeys } from "./UserQueryKeys";

export const useListUserTagsQuery = (filters?: ListUserTagsQuerySchema, args?: QueryArgs<ListUserTagsResponseSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const data = await getter<ListUserTagsQuerySchema, ListUserTagsResponseSchema>({
      path: "/user/tag/list",
      withAuth: "access_token",
      query: {
        ...(filters ?? { page_number: 0, page_size: 100 }),
      },
    });
    return YListUserTagsResponseSchema.cast(data.data);
  };

  return useQuery({
    queryKey: UserQueryKeys.LIST_USER_TAGS(filters),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useDeleteUserTagMutation = (args?: MutationArgs<unknown, UserTagSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (tag: UserTagSchema) => {
    return await deleter({
      path: "/user/tag",
      id: tag.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: UserQueryKeys.LIST_USER_TAGS(),
          predicate: generatePartialMatchPredicate(UserQueryKeys.LIST_USER_TAGS()),
        },
        oldDataDeleter(vars)
      );
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};
