import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MutationArgs, QueryArgs, useGet, usePost } from "./request";
import { useContext } from "react";
import { AuthContext } from "../context";
import { UserAccount } from "../data";

export const useGetSelfQuery = (args?: QueryArgs) => {
  const { get } = useGet();
  const { authToken } = useContext(AuthContext);

  const query = async (): Promise<UserAccount> => {
    const data = await get({
      path: "/user/self",
      withAuth: true,
    });
    return data.data as UserAccount;
  };

  return useQuery({
    queryFn: query,
    queryKey: ["user", authToken],
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: args?.disabled !== true,
  });
};

export const useLoginUserMutation = (args?: MutationArgs<void>) => {
  const { post } = usePost();
  const { setAuthToken } = useContext(AuthContext);

  const mutation = async (data: { readonly username: string; readonly password: string }) => {
    return await post<
      {
        readonly username: string;
        readonly password: string;
      },
      { readonly token: string }
    >({
      path: "/user/login",
      body: { ...data },
      withAuth: false,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (response) => {
      setAuthToken(response.data.token);
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useLogoutUserMutation = (args?: MutationArgs<void>) => {
  const { post } = usePost();
  const { setAuthToken } = useContext(AuthContext);

  const mutation = async () => {
    return await post<never, never>({
      path: "/user/logout",
      body: {} as never,
      withAuth: true,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      setAuthToken(undefined);
      args?.onSuccess?.();
    },
    onError: (err) => {
      setAuthToken(undefined);
      args?.onFailure?.(err);
    },
  });
};

export const useCreateUserMutation = (args?: MutationArgs<void>) => {
  const { post } = usePost();

  const mutation = async (args: { readonly username: string; readonly password: string }) => {
    return await post<typeof args, never>({
      path: "/user/create",
      body: args,
      withAuth: false,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useVerifyAccountMutation = (args?: MutationArgs<void>) => {
  const { post } = usePost();
  const queryClient = useQueryClient();
  const { authToken } = useContext(AuthContext);

  const mutation = async (args: { readonly token: string }) => {
    return await post<typeof args, never>({
      path: "/user/verify-email",
      body: args,
      withAuth: true,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", authToken],
      });
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useRequestVerifyAccountMutation = (args?: MutationArgs<void>) => {
  const { post } = usePost();

  const mutation = async () => {
    return await post<never, never>({
      path: "/user/request-token/verify-email",
      body: {} as never,
      withAuth: true,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};
