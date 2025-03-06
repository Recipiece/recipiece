import {
  CreateRecipeRequestSchema,
  ListRecipesQuerySchema,
  ListRecipesResponseSchema,
  RecipeSchema,
  UpdateRecipeRequestSchema,
  YListRecipesResponseSchema,
  YRecipeSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePartialMatchPredicate, oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { filtersToSearchParams, MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { UserQueryKeys } from "../user";
import { RecipeQueryKeys } from "./RecipeQueryKeys";

export const useGetRecipeByIdQuery = (recipeId: number, args?: QueryArgs<RecipeSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const recipe = await getter<never, RecipeSchema>({
      path: `/recipe/${recipeId}`,
      withAuth: "access_token",
    });
    return YRecipeSchema.cast(recipe.data);
  };

  return useQuery({
    queryKey: RecipeQueryKeys.GET_RECIPE(recipeId),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListRecipesToAddToCookbook = (
  search: string,
  cookbook_id: number,
  args?: QueryArgs<ListRecipesResponseSchema>
) => {
  let filters: Partial<ListRecipesQuerySchema> = {
    cookbook_id: cookbook_id,
    cookbook_attachments_filter: "exclude",
    page_number: 0,
    page_size: 5,
  };
  if (search) {
    filters = { ...filters, search };
  }
  const searchParams = filtersToSearchParams(filters);

  const path = `/recipe/list?${searchParams.toString()}`;
  const { getter } = useGet();

  const query = async () => {
    const recipe = await getter<never, ListRecipesResponseSchema>({
      path: path,
      withAuth: "access_token",
    });
    return YListRecipesResponseSchema.cast(recipe.data);
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES_AVAILABLE_TO_COOKBOOK({ search, cookbook_id }),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListRecipesForMealPlanQuery = (
  filters: ListRecipesQuerySchema,
  args?: QueryArgs<ListRecipesResponseSchema>
) => {
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());
  searchParams.append("page_size", "5");

  if (filters.search) {
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const recipes = await getter<never, ListRecipesResponseSchema>({
      path: `/recipe/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListRecipesResponseSchema.cast(recipes.data);
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES_FOR_MEAL_PLAN(filters),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListRecipesQuery = (filters: ListRecipesQuerySchema, args?: QueryArgs<ListRecipesResponseSchema>) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();
  const searchParams = filtersToSearchParams(filters);

  const query = async () => {
    const recipes = await getter<never, ListRecipesResponseSchema>({
      path: `/recipe/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListRecipesResponseSchema.cast(recipes.data);
  };

  return useQuery({
    queryKey: RecipeQueryKeys.LIST_RECIPES(filters),
    queryFn: async () => {
      const results = await query();
      results.data.forEach((recipe) => {
        queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(recipe.id), recipe);
      });
      return results;
    },
    ...(args ?? {}),
  });
};

export const useCreateRecipeMutation = (args?: MutationArgs<RecipeSchema, CreateRecipeRequestSchema>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: CreateRecipeRequestSchema) => {
    const response = await poster({
      path: "/recipe",
      body: data,
      withAuth: "access_token",
    });
    return YRecipeSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, variables, context) => {
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
        },
        oldDataCreator(data)
      );
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.id), data);
      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_TAGS(),
        predicate: generatePartialMatchPredicate(UserQueryKeys.LIST_USER_TAGS()),
      });
      onSuccess?.(data, variables, context);
    },
    ...restArgs,
  });
};

export const useUpdateRecipeMutation = (args?: MutationArgs<RecipeSchema, UpdateRecipeRequestSchema>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: UpdateRecipeRequestSchema) => {
    const response = await putter({
      path: `/recipe`,
      body: data,
      withAuth: "access_token",
    });
    return YRecipeSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
          predicate: generatePartialMatchPredicate(RecipeQueryKeys.LIST_RECIPES()),
        },
        oldDataUpdater(data)
      );
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.id), data);
      queryClient.invalidateQueries({
        queryKey: UserQueryKeys.LIST_USER_TAGS(),
        predicate: generatePartialMatchPredicate(UserQueryKeys.LIST_USER_TAGS()),
      });
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteRecipeMutation = (args?: MutationArgs<unknown, RecipeSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (recipe: RecipeSchema) => {
    const response = await deleter({
      path: "/recipe",
      id: recipe.id,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, recipe, ctx) => {
      queryClient.setQueriesData(
        {
          queryKey: RecipeQueryKeys.LIST_RECIPES(),
          predicate: generatePartialMatchPredicate(RecipeQueryKeys.LIST_RECIPES()),
        },
        oldDataDeleter(recipe)
      );
      queryClient.invalidateQueries({ queryKey: RecipeQueryKeys.GET_RECIPE(recipe.id) });
      onSuccess?.(data, recipe, ctx);
    },
    ...restArgs,
  });
};

export const useParseRecipeFromURLMutation = (args?: MutationArgs<RecipeSchema, string>) => {
  const { poster } = usePost();

  const mutation = async (url: string) => {
    const response = await poster<{ readonly source_url: string }, RecipeSchema>({
      path: "/recipe/parse/url",
      body: {
        source_url: url,
      },
      withAuth: "access_token",
    });
    return YRecipeSchema.cast(response.data, {
      assert: false,
    });
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useForkRecipeMutation = (args?: MutationArgs<RecipeSchema, { readonly original_recipe_id: number }>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (body: { readonly original_recipe_id: number }) => {
    const response = await poster<typeof body, RecipeSchema>({
      path: "/recipe/fork",
      body: { ...body },
      withAuth: "access_token",
    });
    return YRecipeSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData(RecipeQueryKeys.GET_RECIPE(data.id), data);
      queryClient.setQueryData(RecipeQueryKeys.LIST_RECIPES(), oldDataCreator(data));
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};
