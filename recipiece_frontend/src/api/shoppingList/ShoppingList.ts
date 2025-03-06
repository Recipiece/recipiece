import {
  ListShoppingListSharesResponseSchema,
  ListShoppingListsQuerySchema,
  ListShoppingListsResponseSchema,
  RequestShoppingListSessionResponseSchema,
  ShoppingListItemSchema,
  ShoppingListSchema,
  YListShoppingListsResponseSchema,
  YModifyShoppingListResponse,
  YRequestShoppingListSessionResponseSchema,
  YShoppingListSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useLayout } from "../../hooks";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import {
  filtersToSearchParams,
  getWebsocketUrl,
  MutationArgs,
  QueryArgs,
  useDelete,
  useGet,
  usePost,
  usePut,
} from "../Request";
import { ShoppingListQueryKeys } from "./ShoppingListQueryKeys";

export const useShoppingListItemsSubscription = (shoppingListId: number) => {
  const queryClient = useQueryClient();
  const {
    data: wsSession,
    isLoading: isLoadingWsSession,
    isFetching: isFetchingWsSession,
  } = useRequestShoppingListSessionQuery(+shoppingListId!);

  const [isWebsocketLoading, setIsWebsocketLoading] = useState(true);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [isError, setIsError] = useState<WebSocketEventMap["error"] | undefined>(undefined);
  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItemSchema[]>([]);

  const isLoading = useMemo(() => {
    return isWebsocketLoading || isLoadingWsSession || isFetchingWsSession;
  }, [isWebsocketLoading, isLoadingWsSession, isFetchingWsSession]);

  const { sendMessage, readyState } = useWebSocket(
    `${getWebsocketUrl()}/shopping-list/modify`,
    {
      queryParams: {
        token: wsSession?.token ?? "",
      },
      onError: (event) => {
        setIsError(event);
        setIsPerformingAction(false);
        setIsWebsocketLoading(false);
      },
      onMessage: (event) => {
        const { responding_to_action, items } = YModifyShoppingListResponse.cast(JSON.parse(event.data));
        if (responding_to_action !== "__ping__" && !!items) {
          queryClient.setQueryData(
            ShoppingListQueryKeys.GET_SHOPPING_LIST(shoppingListId),
            (oldData: ShoppingListSchema | undefined) => {
              if (oldData) {
                return {
                  ...oldData,
                  items: [...items],
                };
              }
              return undefined;
            }
          );
          queryClient.setQueriesData(
            {
              queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
            },
            (oldData: ListShoppingListsResponseSchema | undefined) => {
              if (oldData) {
                return {
                  ...oldData,
                  data: (oldData.data ?? []).map((list) => {
                    if (list.id === shoppingListId) {
                      return {
                        ...list,
                        items: [...items],
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
          setShoppingListItems(items as ShoppingListItemSchema[]);
        }
        setIsPerformingAction(false);
      },
      onOpen: () => {
        setIsWebsocketLoading(false);
      },
      onClose: () => {
        setIsWebsocketLoading(true);
      },
      reconnectAttempts: 2,
      reconnectInterval: 1000,
      filter: (event) => {
        const jsony = JSON.parse(event.data);
        return jsony.responding_to_action !== "__ping__";
      },
      heartbeat: {
        message: JSON.stringify({
          action: "__ping__",
        }),
        interval: 5000,
      },
    },
    !!wsSession?.token && !isFetchingWsSession && !isLoadingWsSession
  );

  const setItemNotes = useCallback(
    (item: Partial<ShoppingListItemSchema>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "set_item_notes",
          item: { ...item },
        })
      );
    },
    [sendMessage]
  );

  const clearItems = useCallback(() => {
    setIsPerformingAction(true);
    sendMessage(
      JSON.stringify({
        action: "clear_items",
      })
    );
  }, [sendMessage]);

  const setItemContent = useCallback(
    (item: Partial<ShoppingListItemSchema>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "set_item_content",
          item: { ...item },
        })
      );
    },
    [sendMessage]
  );

  const addItem = useCallback(
    (item: Partial<ShoppingListItemSchema>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "add_item",
          item: { ...item },
        })
      );
    },
    [sendMessage]
  );

  const markItemComplete = useCallback(
    (item: Partial<ShoppingListItemSchema>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "mark_item_complete",
          item: { ...item },
        })
      );
    },
    [sendMessage]
  );

  const markItemIncomplete = useCallback(
    (item: Partial<ShoppingListItemSchema>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "mark_item_incomplete",
          item: { ...item },
        })
      );
    },
    [sendMessage]
  );

  const deleteItem = useCallback(
    (item: Partial<ShoppingListItemSchema>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "delete_item",
          item: { ...item },
        })
      );
    },
    [sendMessage]
  );

  const setItemOrder = useCallback(
    (item: Partial<ShoppingListItemSchema>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "set_item_order",
          item: { ...item },
        })
      );
    },
    [sendMessage]
  );

  /**
   * When we first connect, send a current items action to get the most up to date list
   */
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({ action: "current_items" }));
      setIsWebsocketLoading(false);
    }
  }, [readyState, sendMessage]);

  return {
    shoppingListItems,
    isLoading,
    isPerformingAction,
    isError,
    addItem,
    markItemComplete,
    markItemIncomplete,
    deleteItem,
    setItemOrder,
    setItemContent,
    clearItems,
    setItemNotes,
  };
};

export const useRequestShoppingListSessionQuery = (
  listId: number,
  args?: QueryArgs<RequestShoppingListSessionResponseSchema>
) => {
  const { getter } = useGet();
  const { isMobile } = useLayout();

  const query = async () => {
    const response = await getter<never, RequestShoppingListSessionResponseSchema>({
      path: `/shopping-list/${listId}/session`,
      withAuth: "access_token",
    });
    return YRequestShoppingListSessionResponseSchema.cast(response.data);
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST_SESSION(listId),
    queryFn: query,
    staleTime: 1000,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: isMobile,
    ...(args ?? {}),
  });
};

export const useGetShoppingListByIdQuery = (listId: number, args?: QueryArgs<ShoppingListSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const shoppingList = await getter<never, ShoppingListSchema>({
      path: `/shopping-list/${listId}`,
      withAuth: "access_token",
    });
    return YShoppingListSchema.cast(shoppingList.data);
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST(listId),
    queryFn: query,
    ...(args ?? {}),
  });
};

export const useListShoppingListsQuery = (
  filters: ListShoppingListsQuerySchema,
  args?: QueryArgs<ListShoppingListsResponseSchema>
) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = filtersToSearchParams(filters);
  const query = async () => {
    const shoppingLists = await getter<never, ListShoppingListsResponseSchema>({
      path: `/shopping-list/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return YListShoppingListsResponseSchema.cast(shoppingLists.data);
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(filters),
    queryFn: async () => {
      const results = await query();
      results.data.forEach((shoppingList) => {
        queryClient.setQueryData(["shoppingList", shoppingList.id], shoppingList);
      });
      return results;
    },
    ...(args ?? {}),
  });
};

export const useCreateShoppingListMutation = (args?: MutationArgs<ShoppingListSchema, Partial<ShoppingListSchema>>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<ShoppingListSchema>) => {
    const response = await poster<Partial<ShoppingListSchema>, ShoppingListSchema>({
      path: "/shopping-list",
      body: data,
      withAuth: "access_token",
    });
    return YShoppingListSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, variables, context) => {
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
        },
        oldDataCreator(data)
      );
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST(data.id), data);
      onSuccess?.(data, variables, context);
    },
    ...restArgs,
  });
};

export const useUpdateShoppingListMutation = (args?: MutationArgs<ShoppingListSchema, Partial<ShoppingListSchema>>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<ShoppingListSchema>) => {
    const response = await putter<Partial<ShoppingListSchema>, ShoppingListSchema>({
      path: `/shopping-list`,
      body: data,
      withAuth: "access_token",
    });
    return YShoppingListSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, variables, context) => {
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
        },
        oldDataUpdater(data)
      );
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST(data.id), data);
      onSuccess?.(data, variables, context);
    },
    ...restArgs,
  });
};

export const useDeleteShoppingListMutation = (args?: MutationArgs<unknown, ShoppingListSchema>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (shoppingList: ShoppingListSchema) => {
    return await deleter({
      path: "/shopping-list",
      id: shoppingList.id,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, shoppingList, context) => {
      queryClient.invalidateQueries({ queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST(shoppingList.id) });
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
        },
        oldDataDeleter({ id: shoppingList.id })
      );
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LIST_SHARES(),
        },
        (oldData: ListShoppingListSharesResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: (oldData.data ?? []).filter((share) => share.shopping_list_id !== shoppingList.id),
            };
          }
          return undefined;
        }
      );
      onSuccess?.(data, shoppingList, context);
    },
    ...restArgs,
  });
};

export const useAppendShoppingListItemsMutation = (
  args?: MutationArgs<
    ShoppingListItemSchema[],
    { readonly shopping_list_id: number; readonly items: Partial<ShoppingListItemSchema>[] }
  >
) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (body: {
    readonly shopping_list_id: number;
    readonly items: Partial<ShoppingListItemSchema>[];
  }) => {
    const response = await poster<typeof body, ShoppingListItemSchema[]>({
      path: "/shopping-list/append-items",
      body: body,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, params, ctx) => {
      queryClient.setQueryData(
        ShoppingListQueryKeys.GET_SHOPPING_LIST(params.shopping_list_id),
        (oldData: ShoppingListSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              items: [...data],
            };
          }
          return undefined;
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(),
        },
        (oldData: ListShoppingListsResponseSchema | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: oldData.data.map((list) => {
                if (list.id === params.shopping_list_id) {
                  return {
                    ...list,
                    items: [...data],
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
      onSuccess?.(data, params, ctx);
    },
    ...restArgs,
  });
};
