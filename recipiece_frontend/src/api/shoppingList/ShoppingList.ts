import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { ListShoppingListFilters, ListShoppingListResponse, ShoppingList, ShoppingListItem } from "../../data";
import { oldDataCreator, oldDataDeleter, oldDataUpdater } from "../QueryKeys";
import { getWebsocketUrl, MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { ShoppingListQueryKeys } from "./ShoppingListQueryKeys";

export const useShoppingListItemsSubscription = (shoppingListId: number) => {
  const { data: wsSession, isLoading: isLoadingWsSession, isFetching: isFetchingWsSession } = useRequestShoppingListSessionQuery(+shoppingListId!);

  const [isWebsocketLoading, setIsWebsocketLoading] = useState(true);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [isError, setIsError] = useState<WebSocketEventMap["error"] | undefined>(undefined);
  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);

  const isLoading = useMemo(() => {
    return isWebsocketLoading || isLoadingWsSession || isFetchingWsSession;
  }, [isWebsocketLoading, isLoadingWsSession, isFetchingWsSession]);

  const { sendMessage, readyState } = useWebSocket(
    `${getWebsocketUrl()}/shopping-list/modify`,
    {
      queryParams: {
        token: wsSession?.token!,
      },
      onError: (event) => {
        setIsError(event);
        setIsPerformingAction(false);
        setIsWebsocketLoading(false);
      },
      onMessage: (event) => {
        const { responding_to_action, items } = JSON.parse(event.data);
        if (responding_to_action !== "__ping__" && !!items) {
          setShoppingListItems(items as ShoppingListItem[]);
        }
        setIsPerformingAction(false);
      },
      onOpen: () => {
        setIsWebsocketLoading(false);
      },
      onClose: () => {
        setShoppingListItems([]);
        setIsWebsocketLoading(true);
      },
    },
    !!wsSession?.token && !isFetchingWsSession && !isLoadingWsSession
  );

  /**
   * Ping Pong with the websocket to keep it alive
   */
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      const interval = setInterval(() => {
        sendMessage(
          JSON.stringify({
            action: "__ping__",
          })
        );
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState]);

  const setItemNotes = useCallback(
    (item: Partial<ShoppingListItem>) => {
      setIsPerformingAction(true);
      sendMessage(
        JSON.stringify({
          action: "set_item_notes",
          item: { ...item },
        })
      );
    },
    [sendMessage],
  )

  const clearItems = useCallback(() => {
    setIsPerformingAction(true);
    sendMessage(
      JSON.stringify({
        action: "clear_items",
      })
    );
  }, [sendMessage]);

  const setItemContent = useCallback(
    (item: Partial<ShoppingListItem>) => {
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
    (item: Partial<ShoppingListItem>) => {
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
    (item: Partial<ShoppingListItem>) => {
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
    (item: Partial<ShoppingListItem>) => {
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
    (item: Partial<ShoppingListItem>) => {
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
    (item: Partial<ShoppingListItem>) => {
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

export const useRequestShoppingListSessionQuery = (listId: number, args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async () => {
    const response = await getter<never, { readonly token: string }>({
      path: `/shopping-list/${listId}/session`,
      withAuth: "access_token",
    });
    return response.data;
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST_SESSION(listId),
    queryFn: query,
    enabled: args?.disabled !== true,
    staleTime: 1000,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
  });
};

export const useGetShoppingListByIdQuery = (listId: number, args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async () => {
    const shoppingList = await getter<never, ShoppingList>({
      path: `/shopping-list/${listId}`,
      withAuth: "access_token",
    });
    return shoppingList.data;
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST(listId),
    queryFn: query,
    enabled: args?.disabled !== true,
    retry: 0,
  });
};

export const useListShoppingListsQuery = (filters: ListShoppingListFilters, args?: QueryArgs) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  if (filters.search) {
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const shoppingLists = await getter<never, ListShoppingListResponse>({
      path: `/shopping-list/list?${searchParams.toString()}`,
      withAuth: "access_token",
    });
    return shoppingLists;
  };

  return useQuery({
    queryKey: ShoppingListQueryKeys.LIST_SHOPPING_LISTS(filters),
    queryFn: async () => {
      try {
        const results = await query();
        results.data.data.forEach((shoppingList) => {
          queryClient.setQueryData(["shoppingList", shoppingList.id], shoppingList);
        });
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};

export const useCreateShoppingListMutation = (args?: MutationArgs<ShoppingList>) => {
  const queryClient = useQueryClient();
  const { poster } = usePost();

  const mutation = async (data: Partial<ShoppingList>) => {
    return await poster<Partial<ShoppingList>, ShoppingList>({
      path: "/shopping-list",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(ShoppingListQueryKeys.LIST_SHOPPING_LISTS(), oldDataCreator(data.data));
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST(data.data.id), data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useUpdateShoppingListMutation = (args?: MutationArgs<ShoppingList>) => {
  const queryClient = useQueryClient();
  const { putter } = usePut();

  const mutation = async (data: Partial<ShoppingList>) => {
    return await putter<Partial<ShoppingList>, ShoppingList>({
      path: `/shopping-list`,
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData(ShoppingListQueryKeys.LIST_SHOPPING_LISTS(), oldDataUpdater(data.data));
      queryClient.setQueryData(ShoppingListQueryKeys.GET_SHOPPING_LIST(data.data.id), data.data);
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useDeleteShoppingListMutation = (args?: MutationArgs<void>) => {
  const queryClient = useQueryClient();
  const { deleter } = useDelete();

  const mutation = async (shoppingListId: number) => {
    return await deleter({
      path: "/shopping-list",
      id: shoppingListId,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, shoppingListId) => {
      queryClient.invalidateQueries({ queryKey: ShoppingListQueryKeys.GET_SHOPPING_LIST(shoppingListId) });
      queryClient.setQueryData(ShoppingListQueryKeys.LIST_SHOPPING_LISTS(), oldDataDeleter({ id: shoppingListId }));
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useAppendShoppingListItemsMutation = (args?: MutationArgs<ShoppingListItem[]>) => {
  const { poster } = usePost();

  const mutation = async (data: { readonly shopping_list_id: number; readonly items: Partial<ShoppingListItem>[] }) => {
    return await poster<typeof data, ShoppingListItem[]>({
      path: "/shopping-list/append-items",
      body: data,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      // queryClient.invalidateQueries({
      //   queryKey: ["shoppingListList"],
      //   refetchType: "all",
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["shoppingList", vars.shopping_list_id],
      //   refetchType: "all",
      // });
      args?.onSuccess?.(data.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};
