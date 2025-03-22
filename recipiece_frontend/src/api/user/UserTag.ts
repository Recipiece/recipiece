import {
  ListRecipesResponseSchema,
  ListUserTagsQuerySchema,
  ListUserTagsResponseSchema,
  RecipeSchema,
  UserTagSchema,
  YListUserTagsResponseSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataDeleter } from "../QueryKeys";
import { RecipeQueryKeys } from "../recipe";
import { MutationArgs, QueryArgs, useDelete, useGet } from "../Request";
import { UserQueryKeys } from "./UserQueryKeys";

export const useListUserTagsQuery = (
  filters?: ListUserTagsQuerySchema,
  args?: QueryArgs<ListUserTagsResponseSchema>
) => {
  const { getter } = useGet();

  const query = async () => {
    const data = await getter<ListUserTagsQuerySchema, ListUserTagsResponseSchema>({
      path: "/user-tag/list",
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
      path: "/user-tag",
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

      // kill the tag on any recipes that may have been tagged with this
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
          predicate: generatePartialMatchPredicate(RecipeQueryKeys.LIST_RECIPES()),
        },
        (oldData: ListRecipesResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: oldData.data.map((recipe) => {
                return {
                  ...recipe,
                  tags: [...(recipe.tags ?? [])].filter((t) => t.id !== vars.id),
                };
              }),
            };
          }
        }
      );

      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.GET_RECIPE(),
          predicate: generatePartialMatchPredicate(RecipeQueryKeys.GET_RECIPE()),
        },
        (oldData: RecipeSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              tags: [...(oldData.tags ?? [])].filter((t) => t.id !== vars.id),
            };
          }
        }
      );

      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};
