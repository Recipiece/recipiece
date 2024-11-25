import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListShoppingListFilters, ListShoppingListResponse, ShoppingList, ShoppingListItem } from "../data";
import { getWebsocketUrl, MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "./Request";
import useWebSocket, { ReadyState } from "react-use-websocket";

export const useShoppingListItemsSubscription = (shoppingListId: number) => {
  const { data: wsSession, isLoading: isLoadingWsSession, isFetching: isFetchingWsSession } = useRequestShoppingListSessionQuery(+shoppingListId!);

  const [isWebsocketLoading, setIsWebsocketLoading] = useState(true);
  const [isError, setIsError] = useState<WebSocketEventMap["error"] | undefined>(undefined);
  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);

  const isLoading = useMemo(() => {
    return isWebsocketLoading || isLoadingWsSession;
  }, [isWebsocketLoading, isLoadingWsSession]);

  const { sendMessage, readyState } = useWebSocket(
    `${getWebsocketUrl()}/shopping-list/modify`,
    {
      queryParams: {
        token: wsSession?.token!,
      },
      onError: (event) => {
        setIsError(event);
        setIsWebsocketLoading(false);
      },
      onMessage: (event) => {
        setShoppingListItems(JSON.parse(event.data) as ShoppingListItem[]);
      },
    },
    !!wsSession?.token && !isFetchingWsSession && !isLoadingWsSession
  );

  const addItem = useCallback(
    (item: Partial<ShoppingListItem>) => {
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
    isError,
    addItem,
    markItemComplete,
    markItemIncomplete,
    deleteItem,
    setItemOrder,
  };
};

export const useRequestShoppingListSessionQuery = (listId: number, args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async () => {
    const response = await getter<never, { readonly token: string }>({
      path: `/shopping-list/${listId}/session`,
      withAuth: true,
    });
    return response.data;
  };

  return useQuery({
    queryKey: ["shoppingList", "session", listId],
    queryFn: query,
    enabled: args?.disabled !== true,
    // retry: 0,
    // staleTime: 1000,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });
};

export const useGetShoppingListByIdQuery = (listId: number, args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async () => {
    const shoppingList = await getter<never, ShoppingList>({
      path: `/shopping-list/${listId}`,
      withAuth: true,
    });
    return shoppingList.data;
  };

  return useQuery({
    queryKey: ["shoppingList", listId],
    queryFn: query,
    enabled: args?.disabled !== true,
    retry: 0,
  });
};

export const useListShoppingListsQuery = (filters: ListShoppingListFilters, args?: QueryArgs) => {
  const queryClient = useQueryClient();
  const { getter } = useGet();

  // lol
  const queryKey: any[] = ["shoppingListList"];
  const searchParams = new URLSearchParams();
  searchParams.append("page_number", filters.page_number.toString());

  queryKey.push({ pageNumber: filters.page_number });

  if (filters.search) {
    queryKey.push({ search: filters.search });
    searchParams.append("search", filters.search);
  }

  const query = async () => {
    const shoppingLists = await getter<never, ListShoppingListResponse>({
      path: `/shopping-list/list?${searchParams.toString()}`,
      withAuth: true,
    });
    return shoppingLists;
  };

  return useQuery({
    queryKey: queryKey,
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
      withAuth: true,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["shoppingListList"],
        refetchType: "all",
      });
      queryClient.setQueryData(["shoppingList", data.data.id], data.data);
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
      withAuth: true,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["shoppingListList"],
        refetchType: "all",
      });
      queryClient.setQueryData(["shoppingList", data.data.id], data.data);
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
      withAuth: true,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, shoppingListId) => {
      queryClient.invalidateQueries({
        queryKey: ["shoppingListList"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["shoppingList", shoppingListId],
      });
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};
